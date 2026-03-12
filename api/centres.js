const centres = require("../data/centres.json");

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.send(centres);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
