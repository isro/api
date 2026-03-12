const spacecrafts = require("../data/spacecrafts.json");

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.send(spacecrafts);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
