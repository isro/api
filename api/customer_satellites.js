const fs = require("fs");
const {formatDate, formatToDateFormat} = require("./date_convertor")
let launchers = require("../data/customer_satellites.json");

module.exports = async (req, res) => {
    try {
        const { format } = req.query;
        if(format){
            res.send({"customer_satellites":formatToDateFormat(format, launchers.customer_satellites)})
        }
        res.send({"customer_satellites":formatDate(launchers.customer_satellites)})
    } catch (error) {
        res.status(500);
        const response = error.response || {};
        res.send({
            message: error.message,
            response,
        });
    }
};
