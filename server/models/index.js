"use strict";

const { Sequelize, DataTypes } = require("sequelize");

const userModel = require("../auth/models/users.js");
const roomModel = require("./rooms/model.js");
const messageModel = require("./messages/model.js");
const Collection = require("./data-collection.js");

const DATABASE_URL = process.env.DATABASE_URL || "sqlite:memory:";

const sequelize = new Sequelize(DATABASE_URL);
const rooms = roomModel(sequelize, DataTypes);
const messages = messageModel(sequelize, DataTypes);
const users = userModel(sequelize, DataTypes);

module.exports = {
  db: sequelize,
  // ? The  V routes are built to use collections for rooms and messages

  messages: new Collection(messages),
  userModule: new Collection(users),
  rooms: new Collection(rooms),
  roomsModule: rooms,
  // ? Auth route is made to use raw models
  users, //* Use both */
};
