// Export an async function to handle requests
module.exports = async (req, res) => {
  try {
    // Send a message as the response
    res.send("<pre> ISRO API v0.1.0 </pre>");
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
