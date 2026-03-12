const handler = require("../../api/centres");
const { mockReq, mockRes } = require("../helpers/mock");

describe("GET /api/centres", () => {
  test("returns 200 with application/json header", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._status).toBe(200);
    expect(res._headers["Content-Type"]).toBe("application/json");
  });

  test("response has centres wrapper key with 44 records", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._body).toHaveProperty("centres");
    expect(res._body.centres).toHaveLength(44);
  });

  test("each record has consistent lowercase field names", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const r of res._body.centres) {
      expect(r).not.toHaveProperty("Place");
      expect(r).not.toHaveProperty("State");
      expect(r).toHaveProperty("id");
      expect(r).toHaveProperty("name");
    }
  });

  test("filters by state (case-insensitive)", async () => {
    const res1 = mockRes();
    await handler(mockReq({ state: "Karnataka" }), res1);
    const res2 = mockRes();
    await handler(mockReq({ state: "karnataka" }), res2);
    expect(res1._body.centres.length).toBeGreaterThan(0);
    expect(res1._body.centres).toEqual(res2._body.centres);
    for (const r of res1._body.centres) {
      expect(r.state.toLowerCase()).toBe("karnataka");
    }
  });
});
