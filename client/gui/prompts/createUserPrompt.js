'use strict';


const { newLine } = require('../lib/index');

const createUserPrompt = async (term, socket) => {

    newLine(term, false)

    term('please enter a user name: ') //

    let username = await term.inputField(function (error, input) {

        term.green("\nYour user name is '%s'\n", input)

        socket.emit('UPDATE USER NAME', input)

    }).promise//? Create this input as a promis so it can be awaited and returned

    console.log(username)
};

module.exports = createUserPrompt;
