const handler = require("../../api/spacecrafts");
const { mockReq, mockRes } = require("../helpers/mock");

describe("GET /api/spacecrafts", () => {
  test("returns 200 with application/json header", async () => {
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._headers["Content-Type"]).toBe("application/json");
  });

  test("response has spacecrafts wrapper key with array", async () => {
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res._body).toHaveProperty("spacecrafts");
    expect(Array.isArray(res._body.spacecrafts)).toBe(true);
  });

  test("returns all 113 spacecrafts when no filters", async () => {
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res._body.spacecrafts).toHaveLength(113);
  });

  test("each record has required id and name fields", async () => {
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    for (const record of res._body.spacecrafts) {
      expect(typeof record.id).toBe("number");
      expect(typeof record.name).toBe("string");
      expect(record.name.length).toBeGreaterThan(0);
    }
  });

  test("filters by status (case-insensitive)", async () => {
    const res1 = mockRes();
    await handler(mockReq({ status: "active" }), res1);
    const res2 = mockRes();
    await handler(mockReq({ status: "ACTIVE" }), res2);
    expect(res1._body.spacecrafts.length).toBeGreaterThan(0);
    expect(res1._body.spacecrafts).toEqual(res2._body.spacecrafts);
    for (const r of res1._body.spacecrafts) {
      expect(r.status).toBe("active");
    }
  });

  test("filters by orbit_type", async () => {
    const res = mockRes();
    await handler(mockReq({ orbit_type: "GEO" }), res);
    expect(res._body.spacecrafts.length).toBeGreaterThan(0);
    for (const r of res._body.spacecrafts) {
      expect(r.orbit_type).toBe("GEO");
    }
  });

  test("multiple filters narrow results (AND logic)", async () => {
    const resAll = mockRes();
    await handler(mockReq({ orbit_type: "GEO" }), resAll);

    const resBoth = mockRes();
    await handler(mockReq({ orbit_type: "GEO", status: "decommissioned" }), resBoth);

    expect(resBoth._body.spacecrafts.length).toBeLessThanOrEqual(resAll._body.spacecrafts.length);
    for (const r of resBoth._body.spacecrafts) {
      expect(r.orbit_type).toBe("GEO");
      expect(r.status).toBe("decommissioned");
    }
  });

  test("unknown filter param is ignored, returns full collection", async () => {
    const res = mockRes();
    await handler(mockReq({ not_a_field: "foo" }), res);
    expect(res._body.spacecrafts).toHaveLength(113);
  });

  test("filter that matches nothing returns empty array", async () => {
    const res = mockRes();
    await handler(mockReq({ status: "this_does_not_exist" }), res);
    expect(res._body.spacecrafts).toHaveLength(0);
  });
});
