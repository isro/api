const handler = require("../../api/spacecraft_missions/[id]");
const { mockReq, mockRes } = require("../helpers/mock");

describe("GET /api/spacecraft_missions/:id", () => {
  test("returns the correct record for a valid ID", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "1" }), res);
    expect(res._status).toBe(200);
    expect(res._body.id).toBe(1);
    expect(typeof res._body.name).toBe("string");
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

  test("record includes _links.self and _links.spacecraft", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "1" }), res);
    expect(res._body._links).toHaveProperty("self", "/api/spacecraft_missions/1");
    expect(res._body._links).toHaveProperty("spacecraft");
    expect(res._body._links.spacecraft).toMatch(/^\/api\/spacecrafts\/\d+$/);
  });

  test("record has the full 17-field normalized schema", async () => {
    const res = mockRes();
    await handler(mockReq({ id: "1" }), res);
    const EXPECTED_FIELDS = [
      "id", "name", "mission_type", "launch_date", "launch_site", "launch_vehicle",
      "orbit", "orbit_type", "altitude_km", "inclination_deg", "mass_kg", "power_watts",
      "mission_life", "status", "payloads", "stabilization", "propulsion",
    ];
    for (const field of EXPECTED_FIELDS) {
      expect(res._body).toHaveProperty(field);
    }
  });
});
