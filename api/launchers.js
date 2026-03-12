const data = require("../data/launchers.json");

const ALLOWED_FILTERS = ["vehicle_family"];

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    let results = data.launchers;
    for (const key of ALLOWED_FILTERS) {
      if (req.query[key] !== undefined) {
        const val = String(req.query[key]).toLowerCase();
        results = results.filter(
          (r) => r[key] != null && String(r[key]).toLowerCase() === val
        );
      }
    }
    res.send({ launchers: results });
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
