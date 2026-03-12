const spacecraftMissions = require("../data/spacecraft_missions.json");

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.send(spacecraftMissions);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
