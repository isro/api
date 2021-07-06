/*
 * File         : launchers.js
 * Project      : ISRO API
 * Created Date : Friday, Oct 2nd 2020, 12:03:24 PM
 * Author       : Pramod Devireddy
 *
 * Last Modified: Friday, 2nd October 2020 1:13:00 pm
 * Modified By  : Pramod Devireddy
 *
 * Copyright (c)2020 - Pramod Devireddy
 * ***************************************************************
 */

const fs = require("fs");

let launchers = require("../data/launchers.json");

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
