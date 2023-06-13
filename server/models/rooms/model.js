'use strict';

const roomModel = (sequelize, DataTypes) => sequelize.define('Rooms', {
  name: { type: DataTypes.STRING, required: true },
  // add list of ussers as an array
  description: { type: DataTypes.STRING, required: true }
});

module.exports = roomModel;
