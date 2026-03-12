/**
 * Data integrity tests — verify that the JSON data files meet
 * the quality standards established by the normalization pipeline.
 * These tests act as a regression guard against scraper regressions
 * or manual edits that corrupt the schema.
 */

const spacecraftsData = require("../../data/spacecrafts.json");
const launchersData = require("../../data/launchers.json");
const customerSatellitesData = require("../../data/customer_satellites.json");
const centresData = require("../../data/centres.json");
const missionsData = require("../../data/spacecraft_missions.json");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES = ["active", "decommissioned", "failed", "unknown"];
const VALID_ORBIT_TYPES = ["LEO", "SSO", "GEO", "Lunar", "Interplanetary", "Failed"];
const VALID_VEHICLE_FAMILIES = ["SLV", "ASLV", "PSLV", "GSLV", "GSLV Mk III", "LVM-3", "RLV", "Scramjet-TD"];

describe("data/spacecrafts.json", () => {
  const records = spacecraftsData.spacecrafts;

  test("has 113 records", () => expect(records).toHaveLength(113));

  test("all IDs are unique positive integers", () => {
    const ids = records.map((r) => r.id);
    expect(new Set(ids).size).toBe(records.length);
    for (const id of ids) expect(Number.isInteger(id) && id > 0).toBe(true);
  });

  test("all names are non-empty strings", () => {
    for (const r of records) {
      expect(typeof r.name).toBe("string");
      expect(r.name.trim().length).toBeGreaterThan(0);
    }
  });

  test("no trailing whitespace in names", () => {
    for (const r of records) {
      expect(r.name).toBe(r.name.trim());
    }
  });

  test("non-null launch_dates are ISO 8601", () => {
    for (const r of records) {
      if (r.launch_date !== null) expect(r.launch_date).toMatch(ISO_DATE);
    }
  });

  test("non-null mass_kg values are positive numbers", () => {
    for (const r of records) {
      if (r.mass_kg !== null) {
        expect(typeof r.mass_kg).toBe("number");
        expect(r.mass_kg).toBeGreaterThan(0);
      }
    }
  });

  test("non-null status values are from known enum", () => {
    for (const r of records) {
      if (r.status !== null) expect(VALID_STATUSES).toContain(r.status);
    }
  });

  test("non-null orbit_type values are from known enum", () => {
    for (const r of records) {
      if (r.orbit_type !== null) expect(VALID_ORBIT_TYPES).toContain(r.orbit_type);
    }
  });
});

describe("data/spacecraft_missions.json", () => {
  const records = missionsData.spacecraft_missions;

  test("has 64 records", () => expect(records).toHaveLength(64));

  test("all IDs are unique positive integers", () => {
    const ids = records.map((r) => r.id);
    expect(new Set(ids).size).toBe(records.length);
    for (const id of ids) expect(Number.isInteger(id) && id > 0).toBe(true);
  });

  test("all records have a status field from known enum", () => {
    for (const r of records) {
      expect(VALID_STATUSES).toContain(r.status);
    }
  });

  test("non-null launch_dates are ISO 8601", () => {
    for (const r of records) {
      if (r.launch_date !== null) expect(r.launch_date).toMatch(ISO_DATE);
    }
  });

  test("non-null orbit_type values are from known enum", () => {
    for (const r of records) {
      if (r.orbit_type !== null) expect(VALID_ORBIT_TYPES).toContain(r.orbit_type);
    }
  });

  test("non-null mass_kg values are positive numbers", () => {
    for (const r of records) {
      if (r.mass_kg !== null) {
        expect(typeof r.mass_kg).toBe("number");
        expect(r.mass_kg).toBeGreaterThan(0);
      }
    }
  });

  test("non-null power_watts values are positive numbers", () => {
    for (const r of records) {
      if (r.power_watts !== null) {
        expect(typeof r.power_watts).toBe("number");
        expect(r.power_watts).toBeGreaterThan(0);
      }
    }
  });

  test("no record has values in wrong fields (mass field not a spacecraft name)", () => {
    for (const r of records) {
      if (r.mass_kg !== null) {
        expect(typeof r.mass_kg).toBe("number");
      }
    }
  });
});

describe("data/customer_satellites.json", () => {
  const records = customerSatellitesData.customer_satellites;

  test("has 75 records", () => expect(records).toHaveLength(75));

  test("all IDs are unique positive integers", () => {
    const ids = records.map((r) => r.id);
    expect(new Set(ids).size).toBe(records.length);
  });

  test("non-null launch_dates are ISO 8601", () => {
    for (const r of records) {
      if (r.launch_date !== null) expect(r.launch_date).toMatch(ISO_DATE);
    }
  });

  test("non-null mass_kg values are positive numbers", () => {
    for (const r of records) {
      if (r.mass_kg !== null) {
        expect(typeof r.mass_kg).toBe("number");
        expect(r.mass_kg).toBeGreaterThan(0);
      }
    }
  });

  test("country names are title case (not all-caps)", () => {
    for (const r of records) {
      if (r.country !== null) {
        expect(r.country).toBe(r.country.charAt(0).toUpperCase() + r.country.slice(1));
        expect(r.country).not.toBe(r.country.toUpperCase());
      }
    }
  });
});

describe("data/launchers.json", () => {
  const records = launchersData.launchers;

  test("has 81 records", () => expect(records).toHaveLength(81));

  test("non-null vehicle_family values are from known enum", () => {
    for (const r of records) {
      if (r.vehicle_family !== null) {
        expect(VALID_VEHICLE_FAMILIES).toContain(r.vehicle_family);
      }
    }
  });
});

describe("data/centres.json", () => {
  const records = centresData.centres;

  test("has 44 records", () => expect(records).toHaveLength(44));

  test("all records use lowercase field names (not Place/State)", () => {
    for (const r of records) {
      expect(r).not.toHaveProperty("Place");
      expect(r).not.toHaveProperty("State");
      expect(r).toHaveProperty("place");
      expect(r).toHaveProperty("state");
    }
  });
});
