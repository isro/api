/*
 * File         : index.js
 * Project      : ISRO-API
 * Created Date : Thursday, Oct 1st 2020, 1:02:14 AM
 * Author       : Pramod Devireddy
 *
 * Last Modified: Friday, 2nd October 2020 12:50:11 pm
 * Modified By  : Pramod Devireddy
 *
 * Copyright (c)2020 - Pramod Devireddy
 * ***************************************************************
 */

module.exports = async (req, res) => {
    try {
        res.send("<pre> ISRO API v0.0.1 </pre>");
    } catch (error) {
        res.status(500);
        const response = error.response || {};
        res.send({
            message: error.message,
            response,
        });
    }
};
