const fs = require("fs");

// Load the customer satellite data from a JSON file
let launchers = require("../data/customer_satellites.json");

// Export an async function to handle requests
module.exports = async (req, res) => {
  try {
    // Send the customer satellite data as the response
    res.send(launchers);
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
