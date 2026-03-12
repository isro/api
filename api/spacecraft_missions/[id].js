const missions = require("../../data/spacecraft_missions.json");
const spacecrafts = require("../../data/spacecrafts.json");

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    const id = parseInt(req.query.id, 10);
    if (isNaN(id)) {
      res.status(400);
      return res.send({ error: "Invalid ID" });
    }
    const record = missions.spacecraft_missions.find((m) => m.id === id);
    if (!record) {
      res.status(404);
      return res.send({ error: "Not found" });
    }
    const spacecraft = spacecrafts.spacecrafts.find(
      (s) => s.name.toLowerCase() === record.name.toLowerCase()
    );
    const result = { ...record, _links: { self: `/api/spacecraft_missions/${id}` } };
    if (spacecraft) {
      result._links.spacecraft = `/api/spacecrafts/${spacecraft.id}`;
    }
    res.send(result);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
