'use strict';

const roomModel = (sequelize, DataTypes) => sequelize.define('Rooms', {
  name: { type: DataTypes.STRING, required: true },
  description: { type: DataTypes.STRING, required: true }
});

module.exports = roomModel;
