const fs = require("fs");

// Load the spacecraft missions data from a JSON file
let missions = require("../data/spacecraft_missions.json");

// Export an async function to handle requests
module.exports = async (req, res) => {
  try {
    // Send the spacecraft missions data as the response
    res.send(missions);
  } catch (error) {
    // If there is an error, send a 500 status code and the error message and response
    res.status(500);
    const response = error.response || {};
    res.send({
      message: error.message,
      response,
    });
  }
};