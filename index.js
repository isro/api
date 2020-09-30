/*
 * File         : index.js
 * Project      : ISRO-API
 * Created Date : Thursday, Oct 1st 2020, 1:02:14 AM
 * Author       : Pramod Devireddy
 *
 * Last Modified: Thursday, 1st October 2020 1:40:29 am
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

app.get("/missions", (req, res) => {});

app.get("/launchers", (req, res) => {});

app.get("/spacecrafts", (req, res) => {});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
