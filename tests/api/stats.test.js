const handler = require("../../api/stats");
const { mockReq, mockRes } = require("../helpers/mock");

describe("GET /api/stats", () => {
  let body;

  beforeAll(async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    body = res._body;
  });

  test("returns 200 with application/json header", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._status).toBe(200);
    expect(res._headers["Content-Type"]).toBe("application/json");
  });

  test("response has all top-level sections", () => {
    expect(body).toHaveProperty("totals");
    expect(body).toHaveProperty("spacecraft_missions");
    expect(body).toHaveProperty("spacecrafts");
    expect(body).toHaveProperty("customer_satellites");
    expect(body).toHaveProperty("launchers");
  });

  test("totals match actual collection sizes", () => {
    expect(body.totals.spacecrafts).toBe(113);
    expect(body.totals.launchers).toBe(81);
    expect(body.totals.customer_satellites).toBe(75);
    expect(body.totals.centres).toBe(44);
    expect(body.totals.spacecraft_missions).toBe(64);
  });

  test("mission status counts sum to total missions", () => {
    const sum = Object.values(body.spacecraft_missions.by_status).reduce((a, b) => a + b, 0);
    expect(sum).toBe(body.totals.spacecraft_missions);
  });

  test("mission orbit_type counts sum to total missions", () => {
    const sum = Object.values(body.spacecraft_missions.by_orbit_type).reduce((a, b) => a + b, 0);
    expect(sum).toBe(body.totals.spacecraft_missions);
  });

  test("mission type counts sum to total missions", () => {
    const sum = Object.values(body.spacecraft_missions.by_mission_type).reduce((a, b) => a + b, 0);
    expect(sum).toBe(body.totals.spacecraft_missions);
  });

  test("spacecraft status counts sum to total spacecrafts", () => {
    const sum = Object.values(body.spacecrafts.by_status).reduce((a, b) => a + b, 0);
    expect(sum).toBe(body.totals.spacecrafts);
  });

  test("customer satellite country counts sum to total satellites", () => {
    const sum = Object.values(body.customer_satellites.by_country).reduce((a, b) => a + b, 0);
    expect(sum).toBe(body.totals.customer_satellites);
  });

  test("total_mass_kg is a positive number", () => {
    expect(typeof body.customer_satellites.total_mass_kg).toBe("number");
    expect(body.customer_satellites.total_mass_kg).toBeGreaterThan(0);
  });

  test("launcher vehicle_family counts sum to total launchers", () => {
    const sum = Object.values(body.launchers.by_vehicle_family).reduce((a, b) => a + b, 0);
    expect(sum).toBe(body.totals.launchers);
  });

  test("known statuses present in mission breakdown", () => {
    const statuses = Object.keys(body.spacecraft_missions.by_status);
    expect(statuses).toEqual(expect.arrayContaining(["active", "decommissioned", "failed"]));
  });
});
