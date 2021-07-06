/*
 * File         : customer_satellites.js
 * Project      : NetMon
 * Created Date : Thursday, Oct 8th 2020, 8:04:33 AM
 * Author       : Pramod Devireddy
 *
 * Last Modified: Thursday, 8th October 2020 8:05:01 am
 * Modified By  : Pramod Devireddy
 *
 * Copyright (c)2020 - Pramod Devireddy
 * ************************* Description *************************
 *
 * ***************************************************************
 */


const fs = require("fs");

let launchers = require("../data/customer_satellites.json");

module.exports = async (req, res) => {
    try {
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
