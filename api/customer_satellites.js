const customerSatellites = require("../data/customer_satellites.json");

const ALLOWED_FILTERS = ["country", "launcher"];

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    let results = customerSatellites.customer_satellites;
    for (const key of ALLOWED_FILTERS) {
      if (req.query[key] !== undefined) {
        const val = String(req.query[key]).toLowerCase();
        results = results.filter(
          (r) => r[key] != null && String(r[key]).toLowerCase() === val
        );
      }
    }
    res.send({ customer_satellites: results });
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
