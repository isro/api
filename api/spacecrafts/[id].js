const data = require("../../data/spacecrafts.json");

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    const id = parseInt(req.query.id, 10);
    if (isNaN(id)) {
      res.status(400);
      return res.send({ error: "Invalid ID" });
    }
    const record = data.spacecrafts.find((s) => s.id === id);
    if (!record) {
      res.status(404);
      return res.send({ error: "Not found" });
    }
    res.send(record);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
