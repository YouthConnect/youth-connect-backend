"use strict";

const express = require("express");
const dataModules = require("../models");
const { userModule } = require("../models");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send("Home route!");
});

router.param("model", (req, res, next) => {
  const modelName = req.params.model;

  if (dataModules[modelName]) {
      req.model = dataModules[modelName];
    next();
  } else {
    next("Invalid Model");
  }
});

router.get("/:model", handleGetAll);
router.get("/:model/:id", handleGetOne);
router.post("/:model", handleCreate);
router.put("/:model/:id", handleUpdate);
router.delete("/:model/:id", handleDelete);
router.post("/rooms", handleCreateRoom); // Add the new route for creating rooms

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
