const fs = require("fs");
const formatDate = require("./date_convertor")
let launchers = require("../data/customer_satellites.json");

module.exports = async (req, res) => {
    try {
        const { format } = req.query;
        if(format){
            res.send({"customer_satellites":formatDate(format, launchers.customer_satellites)})
        }
        res.send(launchers);
    } catch (error) {
        res.status(500);
        const response = error.response || {};
        res.send({
            message: error.message,
            response,
        });
    }
};
