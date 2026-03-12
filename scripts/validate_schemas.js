#!/usr/bin/env node
/**
 * Validates all data files against their JSON Schemas.
 * Run: node scripts/validate_schemas.js
 * Exit code 0 = all valid, 1 = validation errors found.
 */

const Ajv = require("ajv");
const path = require("path");
const fs = require("fs");

const ajv = new Ajv({ allErrors: true });

const FILES = [
  { data: "data/spacecrafts.json",         schema: "schemas/spacecrafts.schema.json" },
  { data: "data/launchers.json",            schema: "schemas/launchers.schema.json" },
  { data: "data/customer_satellites.json",  schema: "schemas/customer_satellites.schema.json" },
  { data: "data/centres.json",              schema: "schemas/centres.schema.json" },
  { data: "data/spacecraft_missions.json",  schema: "schemas/spacecraft_missions.schema.json" },
];

const root = path.resolve(__dirname, "..");
let allValid = true;

for (const { data: dataFile, schema: schemaFile } of FILES) {
  const data   = JSON.parse(fs.readFileSync(path.join(root, dataFile), "utf8"));
  const schema = JSON.parse(fs.readFileSync(path.join(root, schemaFile), "utf8"));
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    console.log(`✓ ${dataFile}`);
  } else {
    console.error(`✗ ${dataFile}`);
    for (const err of validate.errors) {
      console.error(`    ${err.instancePath || "(root)"} ${err.message}`);
    }
    allValid = false;
  }
}

process.exit(allValid ? 0 : 1);
