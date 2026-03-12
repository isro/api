const endpoints = {
  spacecrafts: "/api/spacecrafts",
  launchers: "/api/launchers",
  customer_satellites: "/api/customer_satellites",
  centres: "/api/centres",
  spacecraft_missions: "/api/spacecraft_missions",
};

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    res.send({
      name: "ISRO API",
      version: "1.0.0",
      description: "Open Source API for ISRO spacecraft, launcher, and mission data",
      endpoints,
    });
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
