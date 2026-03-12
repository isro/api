const data = require("../data/centres.json");

const ALLOWED_FILTERS = ["state"];

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    let results = data.centres;
    for (const key of ALLOWED_FILTERS) {
      if (req.query[key] !== undefined) {
        const val = String(req.query[key]).toLowerCase();
        results = results.filter(
          (r) => r[key] != null && String(r[key]).toLowerCase() === val
        );
      }
    }
    res.send({ centres: results });
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
