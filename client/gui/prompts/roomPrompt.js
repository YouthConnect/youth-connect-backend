"use strict";

const { newLine } = require("../lib/index");

// room options is coming from the list of rooms in the database (passed in by the client)
const roomPrompt = (term, roomOptions, userId, socket) => {
  term.cyan("Select a room\n");
  term.singleColumnMenu(roomOptions, function (error, response) {
    const selectedRoom = response.selectedText;
    term("\n").eraseLineAfter.green(
      "#%s selected: %s\n",
      response.selectedIndex,
      response.selectedRoom
    );
    socket.emit("join", { room: selectedRoom, id: userId });
  });
};

module.exports = roomPrompt;
