const { newLine } = require('../lib/index');

//instead of returning user input use socket.emit to control the MAIN terminal
const basicInputPrompt = async (term, valueToUpdate, socket) => {
    try {
        newLine(term, false)

        term('please enter a prompt: ')

        let userInput = await term.inputField(function (error, input) {

        term.green("\nYour prompt is '%s'\n", input)

        socket.emit('BASIC INPUT'  , {input, valueToUpdate})

    }).promise

    } catch (error) {
        console.log(error.message);
    }

};

module.exports= basicInputPrompt

