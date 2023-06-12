const { newLine } = require("../lib/index");

//instead of returning user input use socket.emit to control the MAIN terminal
const basicInputPrompt = async (term, valueToUpdate, socket) => {
// name the input prompt by 'console logging' the name
newLine(term, false)
term('please enter a prompt: ')

// do a function with the passed in terminal object
let userInput= await term.inputField(function (error, input) {
//set color and effects
term.green("\nYour prompt is '%s'\n", input)
//update state through socket client because is doesn't work through other methods
socket.emit('BASIC INPUT'  , {input, valueToUpdate})
// return the value entered
}).promise//? Create this input as a promis so it can be awaited and returned
}

module.exports= basicInputPrompt

