const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");

const dataFiles = [
  ["spacecrafts.json", "spacecrafts"],
  ["launchers.json", "launchers"],
  ["customer_satellites.json", "customer_satellites"],
  ["centres.json", "centres"],
];

test("all JSON datasets are valid and non-empty", () => {
  for (const [file, key] of dataFiles) {
    const data = require(path.join(root, "data", file));
    assert.ok(Array.isArray(data[key]), `${file}.${key} must be an array`);
    assert.ok(data[key].length > 0, `${file}.${key} must not be empty`);
  }

  const missions = require(path.join(root, "data", "spacecraft_missions.json"));
  assert.ok(Array.isArray(missions));
  assert.ok(missions.length > 0);
});

test("every dataset has a matching API handler", () => {
  for (const file of fs.readdirSync(path.join(root, "data")).filter((name) => name.endsWith(".json"))) {
    const endpoint = file.replace(".json", "");
    assert.ok(fs.existsSync(path.join(root, "api", `${endpoint}.js`)), `Missing handler for ${endpoint}`);
  }
});

test("README documents every API handler", () => {
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const handlers = fs.readdirSync(path.join(root, "api"))
    .filter((name) => name.endsWith(".js") && name !== "index.js")
    .map((name) => name.replace(".js", ""));

  for (const endpoint of handlers) {
    assert.match(readme, new RegExp(`/api/${endpoint}`), `README is missing /api/${endpoint}`);
  }
});

test("latest spacecraft records remain present", () => {
  const spacecrafts = require(path.join(root, "data", "spacecrafts.json")).spacecrafts;
  const names = spacecrafts.map((spacecraft) => spacecraft.name);

  assert.ok(names.includes("Chandrayaan3"));
  assert.ok(names.includes("Aditya-L1"));
  assert.ok(names.includes("XPoSat"));
  assert.ok(names.includes("NISAR"));
  assert.ok(names.includes("EOS-05"));
  assert.ok(names.includes("NVS-03"));
});

test("recent mission records have matching spacecraft and launcher entries", () => {
  const spacecrafts = require(path.join(root, "data", "spacecrafts.json")).spacecrafts;
  const launchers = require(path.join(root, "data", "launchers.json")).launchers;
  const missions = require(path.join(root, "data", "spacecraft_missions.json"));
  const spacecraftNames = new Set(spacecrafts.map((spacecraft) => spacecraft.name));
  const launcherIds = new Set(launchers.map((launcher) => launcher.id));
  const recentMissions = missions.filter((mission) => ["NISAR", "EOS-05", "NVS-03"].includes(mission.name));

  assert.equal(recentMissions.length, 3);
  for (const mission of recentMissions) {
    assert.ok(spacecraftNames.has(mission.name), `Missing spacecraft entry for ${mission.name}`);
    assert.ok(launcherIds.has(mission.launch_vehicle), `Missing launcher entry for ${mission.launch_vehicle}`);
    assert.match(mission.launch_date, /^[A-Z][a-z]+ \d{1,2}, 20\d{2}$/);
  }
});
