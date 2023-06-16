'use strict';


const { newLine } = require('../lib/index');

const createRoomPrompt = async (term, socket) => {
    try {
        newLine(term, false)

        term('please enter a room name: ') //

        let roomname = await term.inputField(function (error, input) {

            term.green("\nYour room name is '%s'\n", input)

            socket.emit('UPDATE ROOM NAME', input)


        }).promise//? Create this input as a promis so it can be awaited and returned

        console.log(roomname)

    } catch (error) {
        console.log(error.message);
    }

};

module.exports = createRoomPrompt;
