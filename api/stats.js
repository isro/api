const spacecrafts = require("../data/spacecrafts.json");
const launchers = require("../data/launchers.json");
const customerSatellites = require("../data/customer_satellites.json");
const centres = require("../data/centres.json");
const spacecraftMissions = require("../data/spacecraft_missions.json");

function countBy(arr, field) {
  return arr.reduce((acc, item) => {
    const key = item[field] != null ? String(item[field]) : "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

module.exports = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const missions = spacecraftMissions.spacecraft_missions;
    const crafts = spacecrafts.spacecrafts;
    const sats = customerSatellites.customer_satellites;
    const launch = launchers.launchers;
    const centreList = centres.centres;

    const totalMassKg = sats.reduce((sum, s) => sum + (s.mass_kg || 0), 0);

    res.send({
      totals: {
        spacecrafts: crafts.length,
        launchers: launch.length,
        customer_satellites: sats.length,
        centres: centreList.length,
        spacecraft_missions: missions.length,
      },
      spacecraft_missions: {
        by_status: countBy(missions, "status"),
        by_orbit_type: countBy(missions, "orbit_type"),
        by_mission_type: countBy(missions, "mission_type"),
      },
      spacecrafts: {
        by_status: countBy(crafts, "status"),
        by_orbit_type: countBy(crafts, "orbit_type"),
      },
      customer_satellites: {
        by_country: countBy(sats, "country"),
        total_mass_kg: Math.round(totalMassKg * 10) / 10,
      },
      launchers: {
        by_vehicle_family: countBy(launch, "vehicle_family"),
      },
    });
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
