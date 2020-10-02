/*
 * File         : spacecrafts.js
 * Project      : ISRO API
 * Created Date : Friday, Oct 2nd 2020, 12:03:34 PM
 * Author       : Pramod Devireddy
 *
 * Last Modified: Friday, 2nd October 2020 1:14:18 pm
 * Modified By  : Pramod Devireddy
 *
 * Copyright (c)2020 - Pramod Devireddy
 * ***************************************************************
 */

const fs = require("fs");

var launchers = require("../data/spacecrafts.json");

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
