#!/usr/bin/env python3
"""
ISRO API Data Normalization Pipeline
=====================================
Cleans, normalizes, and enriches all JSON data files for the ISRO API.

Handles:
- spacecraft_missions.json: 9+ field name variants for mass, 5+ for power,
  15+ date formats, trailing newlines, duplicate entries, inconsistent schemas
- spacecrafts.json: enriches bare id+name with data from missions
- launchers.json: enriches bare id with vehicle family classification
- customer_satellites.json: normalizes country names, dates, mass types
- centres.json: fixes inconsistent field casing

Run: python scripts/normalize_data.py
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

# ---------------------------------------------------------------------------
# Date parsing
# ---------------------------------------------------------------------------
DATE_FORMATS = [
    "%Y-%m-%d",        # ISO 8601 (idempotent re-runs)
    "%B %d, %Y",       # April 19, 1975
    "%b %d, %Y",       # Jun 07, 1979 / Jul 01, 2013
    "%B %d,%Y",        # June19,1981 (after space insertion)
    "%b %d,%Y",        # Jun 07,1979
    "%d %B %Y",        # 22 October 2008
    "%d %b %Y",        # 22 Oct 2008
    "%d-%m-%Y",        # 26-05-1999
    "%B %Y",           # fallback for month+year only
]

# Insert space between month name and day if missing: "June19,1981" -> "June 19,1981"
_DATE_FIX_NOSPACE = re.compile(r'([a-zA-Z])(\d)')
# Remove ordinal suffixes: "22nd" -> "22", "3rd" -> "3"
_DATE_FIX_ORDINAL = re.compile(r'(\d+)(st|nd|rd|th)\b')


def parse_date(raw):
    """Parse a date string in any of ISRO's many formats into ISO 8601 (YYYY-MM-DD)."""
    if not raw or not isinstance(raw, str):
        return None
    s = raw.strip()
    if not s:
        return None
    # Fix missing space between month name and digit
    s = _DATE_FIX_NOSPACE.sub(r'\1 \2', s)
    # Remove ordinal suffixes
    s = _DATE_FIX_ORDINAL.sub(r'\1', s)
    # Normalize non-standard abbreviations: "Sept" -> "Sep"
    s = re.sub(r'\bSept\b', 'Sep', s)
    # Normalize multiple spaces
    s = re.sub(r'\s+', ' ', s).strip()

    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    # Last resort: try to find a year
    m = re.search(r'\b((?:19|20)\d{2})\b', s)
    if m:
        return m.group(1)  # Return just the year
    return raw.strip()  # Return cleaned original if nothing works


# ---------------------------------------------------------------------------
# Numeric extraction helpers
# ---------------------------------------------------------------------------
def extract_first_number(s):
    """Extract the first numeric value from a string like '1380 kg (Mass at lift off)'."""
    if s is None:
        return None
    if isinstance(s, (int, float)):
        return float(s)
    s = str(s).strip()
    if not s:
        return None
    # Remove commas in numbers: "2,650" -> "2650"
    s_clean = s.replace(',', '')
    m = re.search(r'[\d.]+', s_clean)
    if m:
        try:
            return float(m.group())
        except ValueError:
            return None
    return None


def extract_mass_kg(entry):
    """Extract lift-off mass in kg from any of the 9+ field name variants."""
    mass_fields = [
        'mass_kg',  # our normalized field (shouldn't exist yet, but just in case)
        'lift-off_weight', 'lift-off_mass', 'mass_at_lift-off', 'mass_at_lift_off',
        'off_mass', 'overall_mass', 'spacecraft_mass', 'weight', 'mass',
    ]
    for field in mass_fields:
        val = entry.get(field)
        if val is not None:
            num = extract_first_number(val)
            if num is not None and num > 0:
                return num
    return None


def extract_power_watts(entry):
    """Extract power in watts from various field names and formats.

    Handles tricky cases like '15 Sq.m Solar Array generating 1360W' where the
    first number is the panel area, not the wattage.
    """
    power_fields = [
        'power_watts',  # normalized field name (for idempotent re-runs)
        'power', 'onboard_power', 'on_board_power', 'electrical_power',
        'onboard_orbit',  # known typo for onboard_power
        'power_generation',
    ]
    for field in power_fields:
        val = entry.get(field)
        if val is not None:
            # Already a number (idempotent re-run)
            if isinstance(val, (int, float)):
                return float(val)
            s = str(val).strip()
            # "One KW approx" -> 1000
            if re.match(r'one\s+kw', s, re.IGNORECASE):
                return 1000.0

            # Look for explicit wattage near "W" or "Watts" or "watt" first.
            # This avoids extracting solar panel area (e.g. "15 Sq.m") instead
            # of the actual power number (e.g. "generating 1360W").
            watt_match = re.search(
                r'([\d,]+(?:\.\d+)?)\s*(?:watts?|w)\b', s, re.IGNORECASE
            )
            if watt_match:
                num_str = watt_match.group(1).replace(',', '')
                try:
                    return float(num_str)
                except ValueError:
                    pass

            # Check if it's in kW
            kw_match = re.search(
                r'([\d,]+(?:\.\d+)?)\s*kw\b', s, re.IGNORECASE
            )
            if kw_match:
                num_str = kw_match.group(1).replace(',', '')
                try:
                    return float(num_str) * 1000
                except ValueError:
                    pass

            # Fallback: extract first number (for simple cases like "3100")
            num = extract_first_number(s)
            if num is not None and num > 0:
                return num
    return None


def extract_inclination_deg(entry):
    """Extract inclination as a float from various formats."""
    inc_fields = ['inclination_deg',  # normalized (idempotent)
                  'inclination', 'mean_inclination', 'orbit_inclination']
    for field in inc_fields:
        val = entry.get(field)
        if val is not None:
            num = extract_first_number(str(val))
            if num is not None:
                return num
    return None


def extract_altitude_km(entry):
    """Extract altitude in km."""
    alt_fields = ['altitude_km',  # normalized field name (idempotent)
                  'altitude', 'mean_altitude', 'orbit_altitude', 'orbit_height',
                  'orbit_altitude_at_injection']
    # Handle mangled field name from fresh scraper output
    for key in list(entry.keys()):
        if 'altitude' in key.lower() and key not in alt_fields and '_' * 5 in key:
            alt_fields.append(key)
    for field in alt_fields:
        val = entry.get(field)
        if val is not None:
            num = extract_first_number(str(val))
            if num is not None:
                return num
    return None


# ---------------------------------------------------------------------------
# Mission-specific extractors
# ---------------------------------------------------------------------------
def extract_field(entry, field_names):
    """Return the first non-empty value from a list of possible field names."""
    for f in field_names:
        val = entry.get(f)
        if val is not None:
            s = str(val).strip().replace('\n', ' ')
            s = re.sub(r'\s+', ' ', s)
            if s:
                return s
    return None


def clean_name(name):
    """Clean a spacecraft/mission name: strip whitespace, newlines, normalize dashes."""
    if not name:
        return name
    s = name.strip().replace('\n', ' ')
    s = re.sub(r'\s+', ' ', s)
    # Normalize various dash types to standard hyphen
    s = s.replace('\u2013', '-').replace('\u2014', '-')  # en-dash, em-dash
    # Fix "CARTOSAT - 2A" -> "CARTOSAT-2A" (remove spaces around hyphens between word and number)
    s = re.sub(r'\s*-\s*', '-', s)
    return s


def extract_mission_type(entry):
    """Extract mission type/purpose, avoiding mis-stored mission_life values."""
    # Check normalized field first (idempotent re-run)
    val = entry.get('mission_type') or entry.get('mission')
    if val is None:
        return None
    s = str(val).strip()
    # These are mission_life values incorrectly stored in 'mission'
    if re.match(r'^[\d>~]+\s*(years?|months?|days?)', s, re.IGNORECASE):
        return None
    if s.lower() in ('very long',):
        return None
    return s


def extract_mission_life(entry):
    """Extract mission life from various field names, including mis-stored 'mission' field."""
    # First check dedicated mission_life fields
    life_fields = ['mission_life', 'nominal_mission_life', 'life']
    for f in life_fields:
        val = entry.get(f)
        if val is not None:
            s = str(val).strip()
            if s:
                return normalize_mission_life(s)

    # Check if 'mission' field actually contains mission life
    val = entry.get('mission')
    if val is not None:
        s = str(val).strip()
        if re.match(r'^[\d>~]+\s*(years?|months?|days?)', s, re.IGNORECASE):
            return normalize_mission_life(s)
        if s.lower() in ('very long',):
            return s

    return None


def normalize_mission_life(s):
    """Normalize mission life strings to consistent format."""
    s = s.strip()
    # Remove parenthetical details like "(nominal)" or "(Re-entered on ...)"
    # but keep the core info
    core = re.split(r'\s*\(', s)[0].strip()
    if not core:
        core = s
    # "Seven years" -> "7 years", etc.
    word_to_num = {
        'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
        'twelve': '12', 'fifteen': '15', 'seventeen': '17', 'twenty': '20',
    }
    lower = core.lower()
    for word, num in word_to_num.items():
        if lower.startswith(word):
            core = num + core[len(word):]
            break
    # Normalize "Years" -> "years", "Months" -> "months"
    core = re.sub(r'\b(Years?|Months?|Days?)\b', lambda m: m.group().lower(), core)
    # "More Than 12 years" -> ">12 years"
    core = re.sub(r'^more\s+than\s+', '>', core, flags=re.IGNORECASE)
    # "About 8 years" -> "~8 years"
    core = re.sub(r'^about\s+', '~', core, flags=re.IGNORECASE)
    return core


def classify_orbit_type(entry):
    """Classify orbit type from orbit description."""
    # Preserve existing classification on re-runs (idempotent)
    existing = entry.get('orbit_type')
    if existing and existing in ('LEO', 'SSO', 'GEO', 'GTO', 'Lunar', 'Interplanetary', 'Polar', 'Failed'):
        return existing

    orbit = str(entry.get('orbit', '')).lower()
    name = str(entry.get('name', '')).lower()

    if 'not realised' in orbit or 'not achieved' in orbit:
        return "Failed"
    if 'lunar' in orbit or 'chandrayaan' in name or 'moon' in orbit:
        return "Lunar"
    if 'mars' in name or 'mars' in orbit:
        return "Interplanetary"
    if 'geostationary' in orbit or 'geosynchronous' in orbit or 'geo stationary' in orbit:
        return "GEO"
    if 'sun synchronous' in orbit or 'sun-synchronous' in orbit or 'polar sun' in orbit:
        return "SSO"
    if 'polar' in orbit:
        return "Polar"
    # Check altitude for LEO classification
    alt = extract_altitude_km(entry)
    if alt and alt < 2000:
        return "LEO"
    return None


def extract_stabilization(entry):
    """Extract stabilization info from various misspelled field names."""
    fields = ['stabilization', 'stabilisation', 'satbilisation',
              'attitude_and_orbit_control', 'attitude_and_orbit_control_system_(aocs)',
              'attitude_orbit_control', 'attitude_and_orbit_control_system',
              'aocs', 'control_system']
    return extract_field(entry, fields)


def extract_propulsion(entry):
    """Extract propulsion info."""
    fields = ['propulsion', 'propulsion_system', 'rcs']
    return extract_field(entry, fields)


# ---------------------------------------------------------------------------
# Status inference
# ---------------------------------------------------------------------------
def infer_status(entry):
    """Infer whether a mission is active, decommissioned, or failed."""
    # Preserve already-inferred status on re-runs (idempotent)
    existing = entry.get('status')
    if existing and existing in ('active', 'decommissioned', 'failed'):
        return existing

    orbit = str(entry.get('orbit', '')).lower()
    if 'not realised' in orbit or 'not achieved' in orbit:
        return "failed"

    # Check for mission_completed_on or mission_completed_during fields
    for f in ['mission_completed_on', 'mission_completed_during']:
        if entry.get(f):
            return "decommissioned"

    # Check mission_life and orbital_life for re-entry info
    for f in ['mission_life', 'orbital_life', 'orbit_life']:
        val = str(entry.get(f, '')).lower()
        if 're-entered' in val or 're-entry' in val:
            return "decommissioned"

    # Estimate from launch date and mission life
    launch_str = extract_field(entry, ['launch_date', 'date'])
    if launch_str:
        date_iso = parse_date(launch_str)
        if date_iso and len(date_iso) == 10:
            try:
                launch_dt = datetime.strptime(date_iso, "%Y-%m-%d")
                life_str = extract_mission_life(entry)
                if life_str:
                    years_match = re.search(r'(\d+)\s*years?', str(life_str), re.IGNORECASE)
                    months_match = re.search(r'(\d+)\s*months?', str(life_str), re.IGNORECASE)
                    total_years = 0
                    if years_match:
                        total_years = int(years_match.group(1))
                    elif months_match:
                        total_years = int(months_match.group(1)) / 12
                    if total_years > 0:
                        from datetime import timedelta
                        end_dt = launch_dt + timedelta(days=total_years * 365.25)
                        if end_dt < datetime(2026, 1, 1):
                            return "decommissioned"
                        else:
                            return "active"
                # Very old missions without explicit life info
                if launch_dt.year < 2000:
                    return "decommissioned"
            except (ValueError, TypeError):
                pass

    return "unknown"


# ---------------------------------------------------------------------------
# Normalize spacecraft_missions.json
# ---------------------------------------------------------------------------
DUPLICATE_MISSION_IDS = {
    # TES appears twice (id 28 "PSLV-C3 / TES" and id 29 "The Technology Experiment Satellite (TES)")
    # Keep id 29 which has the proper name; drop id 28 which is launcher/spacecraft hybrid name
    28,
}

# Names to exclude (normalized lowercase) -- catches duplicates across data sources
DUPLICATE_MISSION_NAMES = {
    "pslv-c3 / tes",
    "pslv-c3/tes",
}


SCRAPER_OUTPUT = ROOT / "isro_scrape" / "isro_spacecrafts_scraper_output.json"


def _normalize_entry(entry):
    """Normalize a single mission entry into the canonical schema."""
    name = clean_name(entry.get('name', ''))
    launch_date = parse_date(extract_field(entry, ['launch_date', 'date']))
    mission_type = extract_mission_type(entry)
    orbit_type = classify_orbit_type(entry)
    status = infer_status(entry)

    return {
        "id": entry.get('id'),
        "name": name,
        "mission_type": mission_type,
        "launch_date": launch_date,
        "launch_site": extract_field(entry, ['launch_site']),
        "launch_vehicle": extract_field(entry, ['launch_vehicle']),
        "orbit": extract_field(entry, ['orbit']),
        "orbit_type": orbit_type,
        "altitude_km": extract_altitude_km(entry),
        "inclination_deg": extract_inclination_deg(entry),
        "mass_kg": extract_mass_kg(entry),
        "power_watts": extract_power_watts(entry),
        "mission_life": extract_mission_life(entry),
        "status": status,
        "payloads": extract_field(entry, ['payloads', 'payload', 'communication_payloads']),
        "stabilization": extract_stabilization(entry),
        "propulsion": extract_propulsion(entry),
    }


def _merge_records(old, new):
    """Merge two normalized records, preferring non-null values from `new`."""
    merged = dict(old)
    for key, val in new.items():
        if val is not None:
            merged[key] = val
    return merged


def normalize_missions():
    """Normalize spacecraft_missions.json into a consistent schema.

    If a fresh scraper output exists at isro_scrape/isro_spacecrafts_scraper_output.json,
    merges it with the existing data -- fresh scraper data takes priority for non-null
    fields, but existing entries not in the scraper output are preserved.
    """
    with open(DATA_DIR / "spacecraft_missions.json", "r", encoding="utf-8") as f:
        raw = json.load(f)

    # Raw file is a plain array (not wrapped in object)
    if isinstance(raw, list):
        entries = raw
    else:
        entries = raw.get("spacecraft_missions", raw)

    # Build lookup by cleaned name from existing data
    by_name = {}
    for entry in entries:
        eid = entry.get('id')
        if eid in DUPLICATE_MISSION_IDS:
            continue
        record = _normalize_entry(entry)
        if record['name']:
            key = record['name'].lower()
            if key in DUPLICATE_MISSION_NAMES:
                continue
            by_name[key] = record

    # Merge with fresh scraper output if available
    if SCRAPER_OUTPUT.exists():
        print(f"    Merging with fresh scraper output: {SCRAPER_OUTPUT.name}")
        with open(SCRAPER_OUTPUT, "r", encoding="utf-8") as f:
            scraper_data = json.load(f)
        merged_count = 0
        for entry in scraper_data:
            record = _normalize_entry(entry)
            if record['name']:
                key = record['name'].lower()
                if key in DUPLICATE_MISSION_NAMES:
                    continue
                if key in by_name:
                    by_name[key] = _merge_records(by_name[key], record)
                else:
                    by_name[key] = record
                merged_count += 1
        print(f"    Merged {merged_count} records from scraper output")

    normalized = list(by_name.values())

    # Re-assign sequential IDs (oldest first, by launch date)
    def sort_key(r):
        d = r.get('launch_date') or '9999'
        return d
    normalized.sort(key=sort_key)
    for i, record in enumerate(normalized, start=1):
        record['id'] = i

    return {"spacecraft_missions": normalized}


# ---------------------------------------------------------------------------
# Normalize & enrich spacecrafts.json
# ---------------------------------------------------------------------------
def build_missions_lookup(missions_data):
    """Build a lookup dict from cleaned mission name -> mission record."""
    lookup = {}
    for m in missions_data["spacecraft_missions"]:
        name = m["name"]
        if name:
            # Store under exact cleaned name
            lookup[name.lower()] = m
            # Also store under simplified name (remove series suffixes etc.)
            simple = re.sub(r'\s*series\s*satellite\b', '', name, flags=re.IGNORECASE).strip()
            if simple.lower() != name.lower():
                lookup[simple.lower()] = m
    return lookup


def normalize_spacecrafts(missions_data):
    """Enrich spacecrafts.json with data from missions."""
    with open(DATA_DIR / "spacecrafts.json", "r", encoding="utf-8") as f:
        raw = json.load(f)

    spacecrafts = raw.get("spacecrafts", raw)
    lookup = build_missions_lookup(missions_data)

    enriched = []
    for sc in spacecrafts:
        name = clean_name(sc.get('name', ''))
        name_lower = name.lower() if name else ''

        # Try to find matching mission
        mission = lookup.get(name_lower)

        # Try alternative lookups if exact match fails
        if not mission and name_lower:
            # Try without trailing numbers for series satellites
            for key, val in lookup.items():
                if name_lower in key or key in name_lower:
                    mission = val
                    break

        record = {
            "id": sc["id"],
            "name": name,
        }

        if mission:
            record["launch_date"] = mission.get("launch_date")
            record["launch_vehicle"] = mission.get("launch_vehicle")
            record["mission_type"] = mission.get("mission_type")
            record["orbit_type"] = mission.get("orbit_type")
            record["mass_kg"] = mission.get("mass_kg")
            record["status"] = mission.get("status")
        else:
            record["launch_date"] = None
            record["launch_vehicle"] = None
            record["mission_type"] = None
            record["orbit_type"] = None
            record["mass_kg"] = None
            record["status"] = None

        enriched.append(record)

    return {"spacecrafts": enriched}


# ---------------------------------------------------------------------------
# Normalize & enrich launchers.json
# ---------------------------------------------------------------------------
LAUNCHER_FAMILIES = {
    'SLV': 'SLV',
    'ASLV': 'ASLV',
    'PSLV': 'PSLV',
    'GSLV Mk III': 'GSLV Mk III',
    'GSLV-Mk III': 'GSLV Mk III',
    'LVM': 'LVM-3',
    'GSLV': 'GSLV',
    'RLV': 'RLV',
    'Scramjet': 'Scramjet-TD',
}


def classify_launcher_family(launcher_id):
    """Classify a launcher into its vehicle family."""
    lid = str(launcher_id).strip()
    # Check longest prefixes first to avoid GSLV matching before GSLV Mk III
    for prefix in sorted(LAUNCHER_FAMILIES.keys(), key=len, reverse=True):
        if lid.startswith(prefix):
            return LAUNCHER_FAMILIES[prefix]
    return "Unknown"


def normalize_launchers(customer_sats_data):
    """Enrich launchers.json with vehicle family and customer satellite stats."""
    with open(DATA_DIR / "launchers.json", "r", encoding="utf-8") as f:
        raw = json.load(f)

    launchers = raw.get("launchers", raw)

    # Build a map of launcher -> customer satellites launched
    cust_by_launcher = {}
    for sat in customer_sats_data.get("customer_satellites", []):
        lid = sat.get("launcher", "")
        if lid not in cust_by_launcher:
            cust_by_launcher[lid] = []
        cust_by_launcher[lid].append(sat.get("id", ""))

    enriched = []
    for launcher in launchers:
        lid = launcher["id"]
        family = classify_launcher_family(lid)
        cust_sats = cust_by_launcher.get(lid, [])

        record = {
            "id": lid,
            "vehicle_family": family,
        }
        if cust_sats:
            record["customer_satellites_launched"] = cust_sats

        enriched.append(record)

    return {"launchers": enriched}


# ---------------------------------------------------------------------------
# Normalize customer_satellites.json
# ---------------------------------------------------------------------------
COUNTRY_NORMALIZE = {
    "REPUBLIC OF KOREA": "South Korea",
    "GERMANY": "Germany",
    "BELGIUM": "Belgium",
    "INDONESIA": "Indonesia",
    "ARGENTINA": "Argentina",
    "ITALY": "Italy",
    "ISRAEL": "Israel",
    "CANADA": "Canada",
    "JAPAN": "Japan",
    "THE NETHERLANDS": "Netherlands",
    "DENMARK": "Denmark",
    "TURKEY": "Turkey",
    "SWITZERLAND": "Switzerland",
    "ALGERIA": "Algeria",
    "NORWAY": "Norway",
    "SINGAPORE": "Singapore",
    "LUXEMBOURG": "Luxembourg",
    "FRANCE": "France",
    "UNITED KINGDOM": "United Kingdom",
    "UK": "United Kingdom",
    "USA": "United States",
    "BRAZIL": "Brazil",
    "Germany": "Germany",
}


def normalize_customer_satellites():
    """Clean customer_satellites.json: dates, mass, country names."""
    with open(DATA_DIR / "customer_satellites.json", "r", encoding="utf-8") as f:
        raw = json.load(f)

    satellites = raw.get("customer_satellites", raw)
    cleaned = []

    for sat in satellites:
        country_raw = sat.get("country", "").strip()
        country = COUNTRY_NORMALIZE.get(country_raw, country_raw.title())

        # Support both original 'mass' field and normalized 'mass_kg' (idempotent)
        mass_raw = sat.get("mass_kg", sat.get("mass", ""))
        if isinstance(mass_raw, (int, float)):
            mass_kg = float(mass_raw) if mass_raw else None
        else:
            mass_kg = extract_first_number(mass_raw) if mass_raw else None

        launch_date = parse_date(sat.get("launch_date", ""))

        record = {
            "id": sat["id"],
            "country": country,
            "launch_date": launch_date,
            "mass_kg": mass_kg,
            "launcher": sat.get("launcher", ""),
        }
        cleaned.append(record)

    return {"customer_satellites": cleaned}


# ---------------------------------------------------------------------------
# Normalize centres.json
# ---------------------------------------------------------------------------
def normalize_centres():
    """Fix field casing in centres.json."""
    with open(DATA_DIR / "centres.json", "r", encoding="utf-8") as f:
        raw = json.load(f)

    centres = raw.get("centres", raw)
    cleaned = []

    for centre in centres:
        record = {
            "id": centre["id"],
            "name": centre["name"],
            "place": centre.get("Place", centre.get("place", "")),
            "state": centre.get("State", centre.get("state", "")),
        }
        cleaned.append(record)

    return {"centres": cleaned}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def write_json(data, filename):
    """Write data to a JSON file with consistent formatting."""
    path = DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    count = len(list(data.values())[0]) if data else 0
    print(f"  {filename}: {count} records written")


def main():
    print("ISRO API Data Normalization Pipeline")
    print("=" * 50)

    print("\n[1/5] Normalizing spacecraft_missions.json...")
    missions = normalize_missions()
    write_json(missions, "spacecraft_missions.json")

    print("\n[2/5] Normalizing & enriching spacecrafts.json...")
    spacecrafts = normalize_spacecrafts(missions)
    write_json(spacecrafts, "spacecrafts.json")

    print("\n[3/5] Normalizing customer_satellites.json...")
    cust_sats = normalize_customer_satellites()
    write_json(cust_sats, "customer_satellites.json")

    print("\n[4/5] Normalizing & enriching launchers.json...")
    launchers = normalize_launchers(cust_sats)
    write_json(launchers, "launchers.json")

    print("\n[5/5] Normalizing centres.json...")
    centres = normalize_centres()
    write_json(centres, "centres.json")

    # Print summary stats
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    m = missions["spacecraft_missions"]
    print(f"  Missions: {len(m)} records")
    print(f"    - With launch_date: {sum(1 for r in m if r['launch_date'])}")
    print(f"    - With mass_kg:     {sum(1 for r in m if r['mass_kg'])}")
    print(f"    - With power_watts: {sum(1 for r in m if r['power_watts'])}")
    print(f"    - With orbit_type:  {sum(1 for r in m if r['orbit_type'])}")
    print(f"    - Status active:        {sum(1 for r in m if r['status'] == 'active')}")
    print(f"    - Status decommissioned: {sum(1 for r in m if r['status'] == 'decommissioned')}")
    print(f"    - Status failed:         {sum(1 for r in m if r['status'] == 'failed')}")

    sc = spacecrafts["spacecrafts"]
    enriched = sum(1 for r in sc if r.get('launch_date'))
    print(f"\n  Spacecrafts: {len(sc)} records ({enriched} enriched from missions)")

    cs = cust_sats["customer_satellites"]
    countries = set(r['country'] for r in cs)
    print(f"\n  Customer Satellites: {len(cs)} records from {len(countries)} countries")

    la = launchers["launchers"]
    families = set(r['vehicle_family'] for r in la)
    print(f"\n  Launchers: {len(la)} records across {len(families)} families: {sorted(families)}")

    ce = centres["centres"]
    print(f"\n  Centres: {len(ce)} records")

    print("\nDone! All files written to data/")


if __name__ == "__main__":
    main()
