const { newLine } = require('../lib/index');

//instead of returning user input use socket.emit to control the MAIN terminal
const basicInputPrompt = async (term, valueToUpdate, socket) => {

newLine(term, false)
term('please enter a prompt: ')
let userInput = await term.inputField(function (error, input) {
term.green("\nYour prompt is '%s'\n", input)
socket.emit('BASIC INPUT'  , {input, valueToUpdate})
}).promise//? Create this input as a promis so it can be awaited and returned
}





































module.exports= basicInputPrompt

