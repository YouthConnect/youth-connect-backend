"use strict";

const imageModel = (sequelize, DataTypes) =>
  sequelize.define("Images", {
    image: { type: DataTypes.JSON, required: true },
    room: { type: DataTypes.STRING, required: true },
    username: { type: DataTypes.STRING, required: true },
  });

module.exports = imageModel;
