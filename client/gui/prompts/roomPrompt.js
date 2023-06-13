'use strict';

const { newLine } = require('../lib/index');

term.cyan('Select a room\n');

// room options is coming from the list of rooms in the database (passed in by the client)
const roomPrompt = (term, roomOptions, socket) => {

    term.singleColumnMenu(roomOptions, function (error, response) {

        const selectedRoom = response.selectedText;
        term('\n').eraseLineAfter.green(
            "#%s selected: %s (%s,%s)\n",
            response.selectedIndex,
            response.selectedText,
        );
        socket.emit('join', selectedRoom);
    });

}
module.exports = roomPrompt;
