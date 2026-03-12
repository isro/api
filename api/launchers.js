const launchers = require("../data/launchers.json");

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.send(launchers);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
