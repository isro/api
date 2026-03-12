const spacecrafts = require("../../data/spacecrafts.json");
const missions = require("../../data/spacecraft_missions.json");

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    const id = parseInt(req.query.id, 10);
    if (isNaN(id)) {
      res.status(400);
      return res.send({ error: "Invalid ID" });
    }
    const record = spacecrafts.spacecrafts.find((s) => s.id === id);
    if (!record) {
      res.status(404);
      return res.send({ error: "Not found" });
    }
    const mission = missions.spacecraft_missions.find(
      (m) => m.name.toLowerCase() === record.name.toLowerCase()
    );
    const result = { ...record, _links: { self: `/api/spacecrafts/${id}` } };
    if (mission) {
      result._links.mission = `/api/spacecraft_missions/${mission.id}`;
    }
    res.send(result);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
