"use strict";

const { newLine } = require("../client/gui/lib");

const changeState = (payload, socket) => {
  socket.emit("CHANGE STATE", payload);
};

const sendMessage = (payload, socket) => {
  socket.emit("SEND MESSAGE", payload);
};

// this ONLY prints a message, and updates its associated state.
const receiveMessage = (term, payload, state, valueToUpdate, socket) => {
  state[valueToUpdate] = payload.valueToUpdate;
  newLine(term);
  term.blue(`${payload.username}:`, payload.text);
};

// This ONLY tells the server i received a message. thats it.
const receivedMessage = (payload, socket) => {
  socket.emit("RECEIVED MESSAGE", payload);
};

const relayMessage = (payload, socket) => {
  // relay the message to everyone BUT THE SENDER
  socket.broadcast.emit("RELAY MESSAGE", payload);
};

module.exports = {
  sendMessage,
  changeState,
  receiveMessage,
  receivedMessage,
  relayMessage,
};
