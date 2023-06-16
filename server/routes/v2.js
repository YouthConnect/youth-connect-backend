"use strict";

const express = require("express");
const dataModules = require("../models");
const { userModule } = require("../models");

const permissions = require("../auth/middleware/acl");
const bearer = require("../auth/middleware/bearer");

const router = express.Router();

router.get("/", bearer, (req, res) => {
  res.status(200).send("You are bearer authenticated for v2!");
});

router.param("model", (req, res, next) => {
  const modelName = req.params.model;
  console.log(modelName, dataModules[modelName])
  if (dataModules[modelName]) {

      req.model = dataModules[modelName];

    next();
  } else {
    next("Invalid Model");
  }
});

router.get("/:model", bearer, handleGetAll);
router.get("/:model/:id", bearer, handleGetOne);
router.post("/:model", bearer, permissions("create"), handleCreate);
router.put("/:model/:id", bearer, permissions("update"), handleUpdate);
router.delete("/:model/:id", bearer, permissions("delete"), handleDelete);
router.post("/rooms", bearer, permissions("create"), handleCreateRoom); // Add the new route for creating rooms

async function handleGetAll(req, res) {
  try {
    let allRecords = await req.model.get();
    res.status(200).json(allRecords);

  } catch (error) {
    console.log(error.message);
  }
}

async function handleGetOne(req, res) {
  try {
    const id = req.params.id;
    let theRecord = await req.model.get(id);
    res.status(200).json(theRecord);

  } catch (error) {
    console.log(error.message);
  }
}

async function handleCreate(req, res) {
  try {
    let obj = req.body;
    let newRecord = await req.model.create(obj);
    res.status(201).json(newRecord);

  } catch (error) {
    console.log(error.message);
  }
}

async function handleUpdate(req, res) {
  try {
    const id = req.params.id;
    const obj = req.body;
    let updatedRecord = await req.model.update(id, obj);
    res.status(200).json(updatedRecord);

  } catch (error) {
    console.log(error.message);
  }
}

async function handleDelete(req, res) {
  try {
    let id = req.params.id;
    let deletedRecord = await req.model.delete(id);
    res.status(200).json(deletedRecord);

  } catch (error) {
    console.log(error.message);
  }
}

async function handleCreateRoom(req, res) {
  try {
    let roomData = req.body;
    let newRoom = await Room.create(roomData);
    res.status(201).json(newRoom);

  } catch (error) {
    console.log(error.message);
  }
}

module.exports = router;
