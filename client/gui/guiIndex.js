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
} = require("../../socketHandlers/handlerIndex");

// require functions from custom terminal lib that contains our basic functions for working with the terminal-kit
const {
  terminate,
  mainMenu,
  newLine,
  roomMenu,
  adminMenu,
  adminRoomsMenu,
  adminUsersMenu,
} = require("./lib");
const messagePrompt = require("./prompts/messagePrompt");
const usernamePrompt = require("./prompts/usernamePrompt");
const passwordPrompt = require("./prompts/passwordPrompt");
const roomPrompt = require("./prompts/roomPrompt");
const createRoomPrompt = require("./prompts/createRoomPrompt");
const createUserPrompt = require("./prompts/createUserPrompt");

// Socket handlers for the client

socket.on("MESSAGE", (payload) => {
  //receiveMessage(term, payload, state, "currentMessage", socket);
});

socket.on("UPDATED ROOMS", (payload) => {
  state.roomOptions = payload;
});

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

socket.on("GO TO MENU", payload => {
  state.selectedRoom = '';
  state.room = false;
  state.menu = true;
  term.red('You cannot enter that room')
})

socket.on("UPDATE CURRENT ROOM", (payload) => {
  if (payload !== "admins") {
    state.selectedRoom = payload;
    state.room = true;
    roomMenu(term, payload);
  }
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
    payload.forEach((message) => {
      if (message.username === 'admin') {
        term.green(`\n\t${message.username}: ${message.text}`)
      } else {
        term.blue(`\n\t${message.username}: ${message.text}`)
      }
    }
    );
  }
}); // payload = [message1, message2, ....]

socket.on("TELL ME YOU ARE HERE", (payload) => {
  socket.emit("I AM HERE", state.username);
});

socket.on("IM HERE ADMINS", (payload) => {
  term.green(payload);
});

socket.on("CREATED USER", (payload) => {
  socket.emit("CREATE USER", {
    username: payload,
    password: "password",
    DOB: "01/01/2000",
  });
  state.menu = false;
  state.adminUsersMenu= true;
});



socket.on("UPDATE YOUR USER", (payload) => {
  if (payload.username === "admin") {
    term.red("\nyou are an admin");
    socket.emit("join", { user: payload, room: 'admins' });
  }
  // Very first time we set user when they log in
  state.user = payload;

});

socket.on("GET ALL USERS", (payload) => {
console.log("GETTING USERS----", payload)
});

socket.on("UPDATE ROOM NAME", (payload) => {
  socket.emit("CREATE ROOM", {
    name: payload,
    users:null,
    description: `MAIN ROOM ${payload}`,
    minimumAge: 12,
    maxAge: 99,
  });
  state.menu = false;
  state.adminRoomsMenu= true;
});

//ask server for all users connected

const askForConnectedUsers = () => {
  if (state.username === "admin") {
    // ask everyone to report back to me they are here
    socket.emit("GET_CONNECTED_USERS", {});
  }
};

const leaveRoom = () => {
  term(`You have left: ${state.selectedRoom}`);
  socket.emit('leave', state.selectedRoom ? state.selectedRoom : '')
  state.selectedRoom = '';
}

//ask server to give us the most recent messages
const askForRecentMessages = () => {
  if (state.selectedRoom) {
    socket.emit("GET RECENT MESSAGES", state.selectedRoom);
  }
};

askForUpdatedRooms = () => {
  socket.emit("GIVE ME UPDATED ROOMS", {});
};

// create a state to represent information like what menu/action is happening right
const state = {
  menu: true,
  prompt: false,
  chat: false,
  basicPrompt: "null",
  currentMessage: "null",
  selectedRoom: null,
  username: `not-logged-in`,
  isAdmin: false,
};

//!do requests that need to be done async before users interact with terminal!
askForUpdatedRooms();

// get mouse clicks and scroll wheel
term.on("mouse", (name, matches, data) => {

  if (name === "MOUSE_RIGHT_BUTTON_PRESSED") {

  }
});

term.on("key", (name, matches, data) => {

  if (name === "END" || name === "CTRL_C") {
    terminate(term);
  }

  if (name === "HOME") {
    state.menu = true;
    changeState(state, socket);
  }

  /*//? ------------------------------- ADMIN MENUS ------------------------------ */
//create user
  if (state.adminUsersMenu) {
  if (name === "c") {
    state.adminUsersMenu = false;
state.adminMenu = false;
console.log("create user prompt----")
createUserPrompt(term, socket);
  }

  //TODO view all users
  if (name === "l") {
    state.adminUsersMenu = false;
state.adminMenu = false;
console.log("view all users------")
socket.emit("GET ALL USERS", {});
 }

  }

if (state.adminRoomsMenu) {
  if (name === "c") {
    state.adminRoomsMenu = false;
state.adminMenu = false;
console.log("create room prompt")
createRoomPrompt(term, socket);
  }

  //TODO view all rooms
  if (name === "v") {
    state.adminRoomsMenu = false;
state.adminMenu = false;
console.log("view all rooms-----")
socket.emit("GET ALL ROOMS", {});
}
}

  if (state.adminMenu) {
    adminMenu(term);
    // do admin specific commands here
    if (name === "r") {
      state.adminMenu = false;
      state.adminRoomsMenu = true;
      adminRoomsMenu(term);
      console.log("admin rooms menu");
      // roomPrompt(term, state.roomOptions, socket);
    }
    //view the state
    if (name === "v") {
      // no need to change state here
      term.blue(JSON.stringify(state));

    }

    if (name === 'u') {
      askForConnectedUsers();
    }

    

  }

  if (name === "ESCAPE") {
    mainMenu(term);
    state.adminMenu = false;
    state.menu = true;
  }
  if (state.adminUsersMenu) {
    // if they are in admin room menu
    adminUsersMenu(term);
  }

  if (state.adminRoomsMenu) {
    // if they are in admin room menu
    adminRoomsMenu(term);
  }

  if (name === "o") {
    state.adminRoomsMenu = false;
    state.room = true;
    roomPrompt(term, state.roomOptions, state.userId, socket); //potentially change to just view room?
  }
}

  /*//? ------------------------------- NORMAL MENUS ------------------------------ */
  // Only grab these letters if the user is not in a prompt.
  if (state.menu) {
  mainMenu(term);

  if (state.username === "admin") {
    if (name === "a") {
      // if the admin is logged in, and then they press the 'secret key' then show the admin menu
      state.adminMenu = true;
      state.menu = false;
      state.room = true;
      //console.log(state.roomOptions)
      roomPrompt(term, state.roomOptions, state.user, socket);
    }
  }

  if (name === "l") {
    state.chat = true;
    state.menu = false;
    usernamePrompt(term, socket);
  }


  if (state.room) {
    // pass term to use it, and room name to print the room name
    roomMenu(term, state.selectedRoom);

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
      roomPrompt(term, state.roomOptions, state.user, socket);
    }

    // press escape function
    if (name === "ESCAPE") {
      mainMenu(term);
      state.menu = true;
      state.room = false;
      // leave the room in socket server when user exits room menu
      leaveRoom()
    }
  // if in menu and press r
  if (name === "r") {
    // update the state so the functions work correctly
    state.menu = false;
    state.room = true;
    //console.log(state.roomOptions)
    roomPrompt(term, state.roomOptions, state.userId, socket);
  }
}

if (state.chat) {
  if (name === "ESCAPE") {
    roomMenu(term, state.selectedRoom);
    state.chat = false;
    state.room = true;
  }
}

  }
}
});

term.grabInput({ mouse: "button" });
