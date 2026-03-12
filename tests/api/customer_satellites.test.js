const handler = require("../../api/customer_satellites");
const { mockReq, mockRes } = require("../helpers/mock");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("GET /api/customer_satellites", () => {
  test("returns 200 with application/json header", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._status).toBe(200);
    expect(res._headers["Content-Type"]).toBe("application/json");
  });

  test("response has customer_satellites wrapper key with 75 records", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    expect(res._body).toHaveProperty("customer_satellites");
    expect(res._body.customer_satellites).toHaveLength(75);
  });

  test("all non-null launch_dates are ISO 8601 format", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const r of res._body.customer_satellites) {
      if (r.launch_date !== null) {
        expect(r.launch_date).toMatch(ISO_DATE);
      }
    }
  });

  test("all non-null mass_kg values are positive numbers", async () => {
    const res = mockRes();
    await handler(mockReq(), res);
    for (const r of res._body.customer_satellites) {
      if (r.mass_kg !== null) {
        expect(typeof r.mass_kg).toBe("number");
        expect(r.mass_kg).toBeGreaterThan(0);
      }
    }
  });

  test("filters by country", async () => {
    const res = mockRes();
    await handler(mockReq({ country: "Germany" }), res);
    expect(res._body.customer_satellites.length).toBeGreaterThan(0);
    for (const r of res._body.customer_satellites) {
      expect(r.country.toLowerCase()).toBe("germany");
    }
  });

  test("country filter is case-insensitive", async () => {
    const res1 = mockRes();
    await handler(mockReq({ country: "germany" }), res1);
    const res2 = mockRes();
    await handler(mockReq({ country: "GERMANY" }), res2);
    expect(res1._body.customer_satellites).toEqual(res2._body.customer_satellites);
  });
});
