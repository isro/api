const data = require("../data/spacecrafts.json");

const ALLOWED_FILTERS = ["status", "orbit_type", "mission_type", "launch_vehicle"];

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    let results = data.spacecrafts;
    for (const key of ALLOWED_FILTERS) {
      if (req.query[key] !== undefined) {
        const val = String(req.query[key]).toLowerCase();
        results = results.filter(
          (r) => r[key] != null && String(r[key]).toLowerCase() === val
        );
      }
    }
    res.send({ spacecrafts: results });
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
