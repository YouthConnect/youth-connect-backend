const { newLine } = require("../lib/index");

//instead of returning user input use socket.emit to control the MAIN terminal
const messagePrompt = async (term, valueToUpdate, socket) => {
  // name the input prompt by 'console logging' the name
  newLine(term, false);
  term.red("MESSAGE ROOM: ");
  newLine(term);
  newLine(term);
  term.red("please enter a message: ");

  // do a function with the passed in terminal object
  let userInput = await term.inputField({cancelable: true}, function (error, input) {
    //set color and effects
    console.log(input)
    if (!input === undefined) {
      term.green("\nYour message is '%s'\n", input);
      //update state through socket client because is doesn't work through other methods
      socket.emit("MESSAGE", { input, valueToUpdate });
    }

  }).promise; //? Create this input as a promise so it can be awaited and returned
};

module.exports = messagePrompt;
