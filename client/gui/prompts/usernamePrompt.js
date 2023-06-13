'use strict';


const { newLine } = require('../lib/index');

//instead of returning user input use socket.emit to control the MAIN terminal
const usernamePrompt = async (term, socket) => {

    // get username input
    // send it off, and update the state
    // get password input
    // send it off and update the state

    // complete the login by emitting VERIFY USER

    newLine(term, false)

    term('please enter a username: ') //

    let username = await term.inputField(function (error, input) {

        term.green("\nYour username is '%s'\n", input)

        socket.emit('UPDATE USERNAME', input)


    }).promise//? Create this input as a promis so it can be awaited and returned

    console.log(username)
};

module.exports = usernamePrompt;

