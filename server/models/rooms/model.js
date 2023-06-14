"use strict";

const roomModel = (sequelize, DataTypes) =>
  sequelize.define("Rooms", {
    name: { type: DataTypes.STRING, required: true },
    //! THIS IS DANGEROUS
    //?? When you set up an array just check it really works
    users: { type: DataTypes.ARRAY(DataTypes.STRING), required: true }, // allow admins to edit people in a room.
    description: { type: DataTypes.STRING, required: true },
  });

module.exports = roomModel;
