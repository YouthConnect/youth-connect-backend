"use strict";

const { Sequelize, DataTypes } = require("sequelize");

const userModel = require("../auth/models/users.js");
const clothesModel = require("./clothes/model.js");
const foodModel = require("./food/model.js");
const Collection = require("./data-collection.js");

const DATABASE_URL = process.env.DATABASE_URL || "sqlite:memory:";

const sequelize = new Sequelize(DATABASE_URL);
const food = foodModel(sequelize, DataTypes);
const clothes = clothesModel(sequelize, DataTypes);
const users = userModel(sequelize, DataTypes);

module.exports = {
  db: sequelize,
  // ? The  V routes are built to use collections for food and clothes
  food: new Collection(food),
  clothes: new Collection(clothes),
  userModule: new Collection(users),
  // ? Auth route is made to use raw models
  users, //* Use both */
};
