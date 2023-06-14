const { newLine } = require("../lib/index");

//instead of returning user input use socket.emit to control the MAIN terminal
const messagePrompt = async (term, room, username, socket) => {
  // name the input prompt by 'console logging' the name
  newLine(term, false);
  term.red("Send Message - or press ESCAPE to cancel: ");
  newLine(term);
  term.red("message: ");

  // do a function with the passed in terminal object
  let userInput = await term.inputField(
    { cancelable: true },
    function (error, input) {
      //set color and effects

      if (input === undefined) {
      } else {
        //term.green("\nYour message is '%s'\n", input);
        //update state through socket client because is doesn't work through other methods
        //TODO Send the room and the user along with the chat message
        //? MAKE payload = {  text: input, room: "room1", user: username}
        let payload = {
          text: input,
          room: room,
          username: username,
        };
        socket.emit("MESSAGE", payload);
        return
      }
    }
  ).promise; //? Create this input as a promise so it can be awaited and returned
};

module.exports = messagePrompt;
