/*
 * File         : index.js
 * Project      : ISRO-API
 * Created Date : Thursday, Oct 1st 2020, 1:02:14 AM
 * Author       : Pramod Devireddy
 *
 * Last Modified: Thursday, 1st October 2020 2:49:01 am
 * Modified By  : Pramod Devireddy
 *
 * Copyright (c)2020 - Pramod Devireddy
 * ***************************************************************
 */

const express = require("express");
const fs = require("fs");

const app = express();

app.get("/", (req, res) => {
    res.send("<pre> ISRO API v0.0.1 </pre>");
});

app.get("/missions", (req, res) => {
    res.sendFile(__dirname + "/data/missions.json");
});

app.get("/launchers", (req, res) => {
    // var data = JSON.parse(fs.readFileSync("data/launchers.json"));
    // res.json(data);

    res.sendFile(__dirname + "/data/launchers.json");
});

app.get("/spacecrafts", (req, res) => {
    res.sendFile(__dirname + "/data/spacecrafts.json");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
