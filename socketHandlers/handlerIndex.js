'use strict';

const changeState = (payload, socket) => {
  socket.emit('CHANGE STATE', payload)
}

const sendMessage = (payload, socket) => {
  socket.emit('SEND MESSAGE', payload)
}

const receiveMessage = (term, payload, socket) => {
  term.blue('message received', JSON.stringify(payload))
}

const receivedMessage = (payload, socket) => {
  socket.emit('RECEIVED MESSAGE', payload)
}

const updateValue = (payload, state, stateToUpdate) => {
  state[payload.valueToUpdate] = payload.input;
  state[payload.stateToUpdate] = false; // turn off this state
  state.menu = true; // go back to menu after finished with function
};

const relayMessage = (payload, socket) => {
  // relay the message to everyone BUT THE SENDER
  socket.broadcast.emit('RELAY MESSAGE', payload)
}


module.exports = {
  sendMessage,
  changeState,
  receiveMessage,
  receivedMessage,
  updateValue,
  relayMessage
}