const fs = require("fs");

// Load the centers data from a JSON file
let centers = require("../data/centres.json");

// Export an async function to handle requests
module.exports = async (req, res) => {
  try {
    // Send the centers data as the response
    res.send(centers);
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
