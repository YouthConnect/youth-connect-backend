'use strict';

const { newLine } = require('../lib/index');

//instead of returning user input use socket.emit to control the MAIN terminal
const passwordPrompt = async (term, socket) => {
    try {
        //?get password
        newLine(term, false)

        term('please enter a password: ') //

        let password = await term.inputField( function (error, input) {

            term.green("\nYour password is '%s'\n", input)

            socket.emit('UPDATE PASSWORD', input)

        }).promise;

    } catch (error) {
        console.log(error.message);
    }


}//? Create this input as a promise so it can be awaited and returned


module.exports = passwordPrompt;
