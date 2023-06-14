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
  receiveMessage,
  receivedMessage,
} = require("../../socketHandlers/handlerIndex");

// require functions from custom terminal lib that contains our basic functions for working with the terminal-kit
const { terminate, mainMenu, newLine, roomMenu, adminMenu } = require("./lib");
const messagePrompt = require("./prompts/messagePrompt");
const usernamePrompt = require("./prompts/usernamePrompt");
const passwordPrompt = require("./prompts/passwordPrompt");
const roomPrompt = require("./prompts/roomPrompt");

// Socket handlers for the client
// socket.onAny((event, payload) => receivedMessage(event, payload, socket))
//this is not on the UML
socket.on("RELAY MESSAGE", (payload) => receiveMessage(term, payload, socket));

socket.on("MESSAGE", (payload) => {
  //receiveMessage(term, payload, state, "currentMessage", socket);
});

socket.on("UPDATED ROOMS", (payload) => {
  state.roomOptions = payload;
})

socket.on("GO BACK TO ROOM", (payload) => {
  state.room = true;
  //mainMenu(term);
});

socket.on("UPDATE USERNAME", (payload) => {
  state.username = payload;
  passwordPrompt(term, socket);
});
socket.on("UPDATE PASSWORD", (payload) => {
  state.password = payload;
  socket.emit("VERIFY USER", {});
});

socket.on("UPDATE CURRENT ROOM", (payload) => {
  // update the current room state?
  state.selectedRoom = payload;
  state.room = true;
  roomMenu(term, payload);
});

socket.on("GIVE ME YOUR CREDENTIALS", (payload) => {
  socket.emit("HERES MY CREDENTIALS", {
    username: state.username,
    password: state.password,
  });
  state.menu = true;
});

socket.on("SENDING RECENT MESSAGES", (payload) => {
  if (state.room) {
    roomMenu(term);
    payload.forEach((message) =>
      term.blue(`\n\t${message.username}: ${message.text}`)
    );
  }
}); // payload = [message1, message2, ....]

//ask server to give us the most recent messages
const askForRecentMessages = () => {
  if (state.selectedRoom) {
    socket.emit("GET RECENT MESSAGES", state.selectedRoom);
  }
};

askForUpdatedRooms = () => {
  socket.emit("GIVE ME UPDATED ROOMS", {})
}

// create a state to represent information like what menu/action is happening right
const state = {
  menu: true,
  prompt: false,
  chat: false,
  basicPrompt: "null",
  currentMessage: "null",
  selectedRoom: null,
  username: `bobby ${Math.random()}`,
  isAdmin: false, ///////
};

//*do requests that need to be done async before users interact with terminal!
askForUpdatedRooms();

//? mainMenu to introduce features and concepts of the terminal-kit
mainMenu(term);

// get mouse clicks and scroll wheel
term.on("mouse", (name, matches, data) => {
  //console.log("mouse:", name, data);

  if (name === "MOUSE_RIGHT_BUTTON_PRESSED") {
  }
});
// get key inputs
term.on("key", (name, matches, data) => {
  //? console.log("keyboard", name, data);

  //TODO LASSSTTT
  /*if (user.isAdmin && state.isAdmin) {
    showAdminToolColumnSelectorPrompt();
  }*/

  if (name === "END" || name === "CTRL_C") {
    terminate(term);
  }

  if (name === "HOME") {
    state.menu = true;
    changeState(state, socket);
  }

  //? Only grab these letters if the user is not in a prompt.
  if (state.menu) {
    mainMenu(term);

    if (state.username === 'admin') {
      adminMenu(term);

      if (state.adminMenu) {

      }
    }
    //? Start a prompt command

    if (name === "v") {
      // no need to change state here
      term.blue(JSON.stringify(state));
    }

    if (name === "l") {
      state.chat = true;
      state.menu = false;
      usernamePrompt(term, socket);
    }

    // if in menu and press r
    if (name === "r") {
      // update the state so the functions work correctly
      state.menu = false;
      state.room = true;
      //console.log(state.roomOptions)
      roomPrompt(term, state.roomOptions, socket);
    }
  }

  if (state.chat) {
    if (name === "ESCAPE") {
      roomMenu(term, state.selectedRoom);
      state.chat = false;
      state.room = true;
    }

    if(state.isAdmin) {
      adminMenu(term);
    }
  }



  //?socket.leaveRoom()

  //TODO get the list of most recent messages when on the room page.
  //TODO when on the room page, update the list of messages while idle
  if (state.room) {
    // pass term to use it, and room name to print the room name
    roomMenu(term, state.selectedRoom);
    //! get the messages
    askForRecentMessages(state.selectedRoom);

    if (name === "m") {
      state.chat = true;
      state.room = false;
      messagePrompt(term, state.selectedRoom, state.username, socket);
    }

    //press r to view rooms function
    if (name === "CTRL_R") {
      state.menu = true;
      state.room = false;
      roomPrompt(term, state.roomOptions, socket);
    }

    // press escape function
    if (name === "ESCAPE") {
      mainMenu(term);
      state.menu = true;
      state.room = false;
    }
    
  }

});

//* Make the terminal-kit override the normal terminal and listen for input so we can custom things with it */
//! When terminal-kit overrides these inputs it needs to have a way to terminate.
//? This override takes over the normal terminal and that it behaves different

term.grabInput({ mouse: "button" });

//?^ if you comment this out it will allow you to use the terminal normally and terminal-kit will not take over everything.
//* BUT if we don't use it we will not have access to actually grabbing the inputs and doing things with it */
