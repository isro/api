const fs = require("fs");

let centers = require("../data/space_centers.json");

module.exports = async (req, res) => {
    try {
        res.send(centers);
    } catch (error) {
        res.status(500);
        const response = error.response || {};
        res.send({
            message: error.message,
            response,
        });
    }
};
