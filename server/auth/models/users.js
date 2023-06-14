"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {rooms} = require('../../models/index')

const SECRET = process.env.SECRET || "secretstring";

const userModel = (sequelize, DataTypes) => {
  const model = sequelize.define("Users", {
    username: { type: DataTypes.STRING, required: true, unique: true },
    password: { type: DataTypes.STRING, required: true },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      required: true,
      defaultValue: "user",
    },
    DOB: { type: DataTypes.DATEONLY, required: true }, // '03/06/2010'
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign(
          { username: this.username, capabilities: this.capabilities },
          SECRET
        );
      },
      set(tokenObj) {
        let token = jwt.sign(tokenObj, SECRET);
        return token;
      },
    },
    rooms: {
      type: DataTypes.VIRTUAL,
      async get() {
        // get the DOB in years to compare the age ranges
        let today = new Date();
        console.log(today.getFullYear, this.DOB, parseInt(this.DOB.split('/')));
        let age = today.getFullYear() - parseInt(this.DOB.split('/')[2]);
        console.log(today, age)
        console.log(typeof rooms)
        const allRooms = await rooms.get();

        // get the list of rooms, return only the rooms that fit our age range
        let okayRooms = allRooms.filter(room => room.minAge <= age && room.maxAge >= age)
        return okayRooms
      }, async set(rooms) {
        return rooms
      },
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    capabilities: {
      type: DataTypes.VIRTUAL,
      get() {
        const acl = {
          user: ["read", "message"],
          admin: ["read", "message", "create", "update", "delete"],
        };
        return acl[this.role];
      },
    },
  });

  model.beforeCreate(async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ where: { username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      return user;
    }
    throw new Error("Invalid User");
  };

  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, SECRET);
      const user = this.findOne({ where: { username: parsedToken.username } });
      if (user) {
        return user;
      }
      throw new Error("User Not Found");
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return model;
};

module.exports = userModel;
