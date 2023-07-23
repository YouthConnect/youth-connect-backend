'use strict';

const imageModel = (sequelize, DataTypes) =>
sequelize.define('Images', {
  text: { type: DataTypes.STRING, required: true },
  room: { type: DataTypes.STRING, required: true },
  username: { type: DataTypes.STRING, required: true }
});

module.exports = imageModel;
