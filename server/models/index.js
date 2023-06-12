"use strict";

const { Sequelize, DataTypes } = require("sequelize");

const userModel = require("./user.js");
const roomModel = require("./room.js");
const messageModel = require("./message.js");
const Collection = require("./data-collection.js");

const DATABASE_URL = process.env.DATABASE_URL || "sqlite:memory:";

const sequelize = new Sequelize(DATABASE_URL);
const rooms = roomModel(sequelize, DataTypes);
const messages = messageModel(sequelize, DataTypes);
const users = userModel(sequelize, DataTypes);

module.exports = {
  db: sequelize,
  // ? The  V routes are built to use collections for food and clothes
  rooms: new Collection(rooms),
  messages: new Collection(messages),
  userModule: new Collection(users),
  // ? Auth route is made to use raw models
  users, //* Use both */
};
