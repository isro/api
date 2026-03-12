const handler = require("../../api/spacecrafts/[id]");
const { mockReq, mockRes } = require("../helpers/mock");

describe("GET /api/spacecrafts/:id", () => {
  test("returns the correct record for a valid ID", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "1" }), res);
    expect(res._status).toBe(200);
    expect(res._body.id).toBe(1);
    expect(res._body.name).toBe("Aryabhata");
  });

  test("returns 200 with application/json header", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "1" }), res);
    expect(res._headers["Content-Type"]).toBe("application/json");
  });

  test("returns 404 for non-existent ID", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "99999" }), res);
    expect(res._status).toBe(404);
    expect(res._body).toHaveProperty("error");
  });

  test("returns 400 for non-integer ID", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "abc" }), res);
    expect(res._status).toBe(400);
    expect(res._body).toHaveProperty("error");
  });

  test("record includes _links.self", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "1" }), res);
    expect(res._body._links).toHaveProperty("self", "/api/spacecrafts/1");
  });

  test("record includes _links.mission when a matching mission exists", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "1" }), res);
    // Aryabhata has a mission record
    expect(res._body._links).toHaveProperty("mission");
    expect(res._body._links.mission).toMatch(/^\/api\/spacecraft_missions\/\d+$/);
  });
});
