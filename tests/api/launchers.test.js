const handler = require("../../api/launchers");
const { mockReq, mockRes } = require("../helpers/mock");

describe("GET /api/launchers", () => {
  test("returns 200 with application/json header", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._status).toBe(200);
    expect(res._headers["Content-Type"]).toBe("application/json");
  });

  test("response has launchers wrapper key with array of 81 records", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._body).toHaveProperty("launchers");
    expect(res._body.launchers).toHaveLength(81);
  });

  test("each record has an integer id", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const record of res._body.launchers) {
      expect(Number.isInteger(record.id)).toBe(true);
    }
  });

  test("filters by vehicle_family (case-insensitive)", async () => {
    const res1 = mockRes();
    await handler(mockReq({ vehicle_family: "PSLV" }), res1);
    const res2 = mockRes();
    await handler(mockReq({ vehicle_family: "pslv" }), res2);
    expect(res1._body.launchers.length).toBeGreaterThan(0);
    expect(res1._body.launchers).toEqual(res2._body.launchers);
    for (const r of res1._body.launchers) {
      expect(r.vehicle_family).toBe("PSLV");
    }
  });

  test("known vehicle families are present in data", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    const families = new Set(res._body.launchers.map((r) => r.vehicle_family));
    for (const f of ["PSLV", "GSLV", "SLV", "ASLV"]) {
      expect(families.has(f)).toBe(true);
    }
  });
});
