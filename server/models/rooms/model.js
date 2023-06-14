"use strict";

const roomModel = (sequelize, DataTypes) =>
  sequelize.define("Rooms", {
    name: { type: DataTypes.STRING, required: true },
    users: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: null,
    }, // allow admins to edit people in a room.
    description: { type: DataTypes.STRING, required: true },
    minimumAge:{ type: DataTypes.INTEGER, required: true },
    maxAge: { type: DataTypes.INTEGER, required: true }
  });

module.exports = roomModel;
