"use strict";

const messageModel = (sequelize, DataTypes) =>
  sequelize.define("Messages", {
    text: { type: DataTypes.STRING, required: true },
    room: { type: DataTypes.STRING, required: true },
    username: { type: DataTypes.STRING, required: true },
  });

module.exports = messageModel;
