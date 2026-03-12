const spacecraftMissions = require("../data/spacecraft_missions.json");

const ALLOWED_FILTERS = ["status", "orbit_type", "mission_type", "launch_vehicle", "launch_site"];

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    let results = spacecraftMissions.spacecraft_missions;
    for (const key of ALLOWED_FILTERS) {
      if (req.query[key] !== undefined) {
        const val = String(req.query[key]).toLowerCase();
        results = results.filter(
          (r) => r[key] != null && String(r[key]).toLowerCase() === val
        );
      }
    }
    res.send({ spacecraft_missions: results });
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
