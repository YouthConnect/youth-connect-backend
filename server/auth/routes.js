"use strict";

const express = require("express");
const authRouter = express.Router();

const { userModule } = require("../models/index.js");
const basicAuth = require("./middleware/basic.js");
const bearerAuth = require("./middleware/bearer.js");
const permissions = require("./middleware/acl.js");

authRouter.post("/signup", async (req, res, next) => {
  try {
    let userRecord = await userModule.create(req.body);
    const output = {
      user: userRecord,
      token: userRecord.token,
    };
    console.log("Signup Success", output);
    res.status(201).json(output);
  } catch (e) {
    next(e.message);
  }
});

authRouter.post("/signin", basicAuth, (req, res, next) => {
  try {
    const user = {
      user: req.user,
      token: req.user.token,
    };

    res.status(200).json(user);
  } catch (error) {
    next(error.message);
  }
});

authRouter.get(
  "/users",
  bearerAuth,
  permissions("delete"),
  async (req, res, next) => {
    const userRecords = await userModule.findAll({});
    const list = userRecords.map((user) => user.username);
    res.status(200).json(list);
  }
);

authRouter.put(
  "/users/:id/approve",
  bearerAuth,
  permissions("delete"),
  async (req, res, next) => {
    const id = req.params.id;
    try {
      const userRecord = await userModule.findOneAndUpdate({ where: { id } });

      userRecord.update({ approved: true });
    } catch (err) {
      console.log("ERROR APPROVING USER: ", err);
    }
  }
);

authRouter.get("/secret", bearerAuth, async (req, res, next) => {
  res.status(200).send("Welcome to the secret area");
});

module.exports = authRouter;
