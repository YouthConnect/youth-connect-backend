"use strict";

const { newLine } = require("../lib/index");

// room options is coming from the list of rooms in the database (passed in by the client)
const roomPrompt = (term, roomOptions, user, socket) => {

  //[ {...}, {...}, {...}]
 // ['room1', 'room2', 'room3']
 //roomOptions is a list of objects,column menu needs list of strings.
 //convert list of of objects into list of names -> set it = newRoomOptions
 let newRoomOptions = roomOptions.map((room) => room.name);

  term.cyan("Select a room\n");
  term.singleColumnMenu(newRoomOptions, function (error, response) {
    const selectedRoom = response.selectedText;
    term("\n").green(
      "#%s selected: %s\n",
      response.selectedIndex,
      response.selectedRoom
    );
    socket.emit("join", { room: selectedRoom, user: user });
  });
};

module.exports = roomPrompt;
