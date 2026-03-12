const handler = require("../../api/spacecraft_missions");
const { mockReq, mockRes } = require("../helpers/mock");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES = new Set(["active", "decommissioned", "failed", "unknown"]);
const VALID_ORBIT_TYPES = new Set(["LEO", "SSO", "GEO", "Lunar", "Interplanetary", "Failed"]);

describe("GET /api/spacecraft_missions", () => {
  test("returns 200 with application/json header", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._status).toBe(200);
    expect(res._headers["Content-Type"]).toBe("application/json");
  });

  test("response has spacecraft_missions wrapper key with 64 records", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._body).toHaveProperty("spacecraft_missions");
    expect(res._body.spacecraft_missions).toHaveLength(64);
  });

  test("all records have valid status values", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const r of res._body.spacecraft_missions) {
      expect(VALID_STATUSES.has(r.status)).toBe(true);
    }
  });

  test("all non-null orbit_type values are from known set", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const r of res._body.spacecraft_missions) {
      if (r.orbit_type !== null) {
        expect(VALID_ORBIT_TYPES.has(r.orbit_type)).toBe(true);
      }
    }
  });

  test("all non-null launch_dates are ISO 8601 format", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const r of res._body.spacecraft_missions) {
      if (r.launch_date !== null) {
        expect(r.launch_date).toMatch(ISO_DATE);
      }
    }
  });

  test("all non-null mass_kg values are positive numbers", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const r of res._body.spacecraft_missions) {
      if (r.mass_kg !== null) {
        expect(typeof r.mass_kg).toBe("number");
        expect(r.mass_kg).toBeGreaterThan(0);
      }
    }
  });

  test("all non-null power_watts values are positive numbers", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const r of res._body.spacecraft_missions) {
      if (r.power_watts !== null) {
        expect(typeof r.power_watts).toBe("number");
        expect(r.power_watts).toBeGreaterThan(0);
      }
    }
  });

  test("filters by status", async () => {
    const res = mockRes();
    await handler(mockReq({ status: "active" }), res);
    expect(res._body.spacecraft_missions.length).toBeGreaterThan(0);
    for (const r of res._body.spacecraft_missions) {
      expect(r.status).toBe("active");
    }
  });

  test("filters by orbit_type", async () => {
    const res = mockRes();
    await handler(mockReq({ orbit_type: "SSO" }), res);
    expect(res._body.spacecraft_missions.length).toBeGreaterThan(0);
    for (const r of res._body.spacecraft_missions) {
      expect(r.orbit_type).toBe("SSO");
    }
  });

  test("combined filters return intersection", async () => {
    const res = mockRes();
    await handler(mockReq({ orbit_type: "GEO", status: "decommissioned" }), res);
    for (const r of res._body.spacecraft_missions) {
      expect(r.orbit_type).toBe("GEO");
      expect(r.status).toBe("decommissioned");
    }
  });
});
