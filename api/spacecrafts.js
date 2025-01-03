const fs = require("fs");

// Load the data for the available spacecrafts from a JSON file
let spacecrafts = require("../data/spacecrafts.json");

// Export an async function to handle requests for the list of available spacecrafts
module.exports = async (req, res) => {
  try {
    // Send the list of available spacecrafts as the response
    res.send(spacecrafts);
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
