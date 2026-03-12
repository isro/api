# ISRO API

Open Source API for ISRO spacecraft, launcher, and mission data.

**Live:** [isro.vercel.app](https://isro.vercel.app)

## API Endpoints

| Endpoint | Description | Records |
|----------|-------------|---------|
| [`/api/spacecrafts`](https://isro.vercel.app/api/spacecrafts) | All ISRO spacecrafts with launch date, vehicle, orbit type, and status | 113 |
| [`/api/launchers`](https://isro.vercel.app/api/launchers) | Launch vehicles classified by family (SLV, ASLV, PSLV, GSLV, LVM-3) | 81 |
| [`/api/customer_satellites`](https://isro.vercel.app/api/customer_satellites) | Foreign satellites launched by ISRO, with ISO dates and normalized countries | 75 |
| [`/api/centres`](https://isro.vercel.app/api/centres) | ISRO research centres across India | 44 |
| [`/api/spacecraft_missions`](https://isro.vercel.app/api/spacecraft_missions) | Detailed mission data: mass, power, orbit, payloads, stabilization, status | 65 |

## Response Format

All endpoints return JSON with a consistent wrapper:

```json
{
  "spacecrafts": [
    {
      "id": 1,
      "name": "Aryabhata",
      "launch_date": "1975-04-19",
      "launch_vehicle": "C-1 Intercosmos",
      "mission_type": "Scientific/ Experimental",
      "orbit_type": null,
      "mass_kg": 360.0,
      "status": "decommissioned"
    }
  ]
}
```

### Spacecraft Missions Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Sequential ID |
| `name` | string | Spacecraft name |
| `mission_type` | string\|null | Mission purpose (Communication, Remote Sensing, etc.) |
| `launch_date` | string\|null | ISO 8601 date (YYYY-MM-DD) |
| `launch_site` | string\|null | Launch facility |
| `launch_vehicle` | string\|null | Rocket used |
| `orbit` | string\|null | Orbit description |
| `orbit_type` | string\|null | Classified: LEO, SSO, GEO, Lunar, Interplanetary, Failed |
| `altitude_km` | number\|null | Orbital altitude in km |
| `inclination_deg` | number\|null | Orbital inclination in degrees |
| `mass_kg` | number\|null | Lift-off mass in kg |
| `power_watts` | number\|null | Onboard power in watts |
| `mission_life` | string\|null | Designed mission lifetime |
| `status` | string | active, decommissioned, failed, or unknown |
| `payloads` | string\|null | Onboard instruments/payloads |
| `stabilization` | string\|null | Attitude control system |
| `propulsion` | string\|null | Propulsion system |

## Data Normalization

Raw data is scraped from [isro.gov.in](https://www.isro.gov.in) and normalized using `scripts/normalize_data.py`. The pipeline:

- Parses 15+ date formats into ISO 8601
- Resolves 9+ field name variants for mass (e.g., `weight`, `lift-off_mass`, `spacecraft_mass`) into `mass_kg`
- Extracts wattage from complex power strings (e.g., "15 Sq.m Solar Array generating 1360W" -> 1360)
- Classifies orbit types (LEO, SSO, GEO, Lunar, etc.)
- Infers mission status (active/decommissioned/failed) from launch date + mission life
- Normalizes country names and fixes field casing inconsistencies
- Merges fresh scraper output with existing data (idempotent)

```bash
# Run the normalization pipeline
python scripts/normalize_data.py
```

## Tech Stack

- **Runtime:** Node.js (Vercel Serverless Functions)
- **Data:** Static JSON, zero npm dependencies
- **Data Pipeline:** Python 3 (BeautifulSoup for scraping, custom normalization)
- **Hosting:** [Vercel](https://vercel.com)

## Contributing

1. Fork the repository
2. To update data: edit files in `data/` or run the scraper and normalization pipeline
3. To add endpoints: create a new file in `api/` (Vercel auto-routes it)
4. Submit a pull request

## License

MIT
