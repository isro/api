const customerSatellites = require("../data/customer_satellites.json");

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.send(customerSatellites);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
