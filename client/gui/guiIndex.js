//? Create a terminal interface that uses functions and sockets to manage its state (menu, prompting, sending and receiving data etc)
// create the terminal instance
const term = require("terminal-kit").terminal;
// create a socket client and give it functions
//? Client socket hub
const { io } = require("socket.io-client");
const socket = io("http://localhost:3001");

//? require functions from the socket client lib that contains basic handlers for our socket client
const {
  changeState,
  sendMessage,
  receiveMessage,
  receivedMessage,
  updateValue,
} = require("../../socketHandlers/handlerIndex");

// require functions from custom terminal lib that contains our basic functions for working with the terminal-kit
const { terminate, introduction, newLine } = require("./lib");
const basicInputPrompt = require("../gui/prompts/basicInputPrompts");
const messagePrompt = require("./prompts/messagePrompt");
const usernamePrompt = require('./prompts/usernamePrompt');
const passwordPrompt = require('./prompts/passwordPrompt');

// Socket handlers for the client
//socket.onAny((event, payload) => receivedMessage(event, payload, socket))
//this is not on the UML
socket.on("RELAY MESSAGE", (payload) => receiveMessage(term, payload, socket));
socket.on("UPDATE VALUE", (payload) => updateValue(payload, state));
socket.on("MESSAGE", (payload) => {
  receiveMessage(term, payload, state, "currentMessage", socket);
});
socket.on("RESTART MESSAGE PROMPT", (payload) => {
  messagePrompt(term, socket);
});

socket.on("UPDATE USERNAME", (payload) => {
  state.username = payload
  passwordPrompt(term, socket)
})
socket.on("UPDATE PASSWORD", (payload) => {
  state.password = payload
  socket.emit('VERIFY USER', {})
})

socket.on("GIVE ME YOUR CREDENTIALS", (payload) => {
  st.emit("HERES MY CREDENTIALS", { username: state.username, password: state.password })
})
//

//

let basicPrompt = "";

//* oof of life message */
socket.emit("SEND MESSAGE", "Hello! I am the socket client!");

//

// create a state to represent information like what menu/action is happening right
const state = {
  menu: true,
  prompt: false,
  chat: false,
  basicPrompt: "null",
  currentMessage: "null",
};

//? introduction to introduce features and concepts of the terminal-kit
introduction(term);

// get mouse clicks and scroll wheel
term.on("mouse", (name, matches, data) => {
  console.log("mouse:", name, data);

  if (name === "MOUSE_RIGHT_BUTTON_PRESSED") {
  }
});
// get key inputs
term.on("key", (name, matches, data) => {
  //? console.log("keyboard", name, data);

  if (name === "END" || name === "CTRL_C") {
    terminate(term);
  }

  if (name === "HOME") {
    state.menu = true;
    changeState(state, socket);
  }

  //? Only grab these letters if the user is not in a prompt.
  if (state.menu) {
    term("MAIN PAGE:");
    newLine(term);
    newLine(term);
    newLine(term);
    //? Start a prompt command
    if (name === "p") {
      // update the state so the functions work correctly
      state.menu = false;
      state.prompt = true;
      //? pass in the terminal, value to update, and socket into the function to update State and values
      basicInputPrompt(term, "basicPrompt", socket);
    }

    if (name === "v") {
      // no need to change state here
      term.blue(JSON.stringify(state));
    }

    if (name === "m") {
      state.chat = true;
      state.menu = false;
      messagePrompt(term, socket);
    }

    if (name === "m") {
      messagePrompt(term, socket);
    }

    if (name === 'l') {
      state.chat = true;
      state.menu = false;
      usernamePrompt(term, socket);
    }
  }

  if (state.chat) {
    if (name === "ESCAPE") {
      console.log("RETURNING TO MENU");
      state.chat = false;
      state.menu = true;
      term.asyncCleanup();
      term.grabInput(true);
    }
  }
});

//* Make the terminal-kit override the normal terminal and listen for input so we can custom things with it */
//! When terminal-kit overrides these inputs it needs to have a way to terminate.
//? This override takes over the normal terminal and that it behaves different

term.grabInput({ mouse: "button" });

//?^ if you comment this out it will allow you to use the terminal normally and terminal-kit will not take over everything.
//* BUT if we don't use it we will not have access to actually grabbing the inputs and doing things with it */
// export the menu STATE so it can be accessed elsewhere
module.exports = state;
