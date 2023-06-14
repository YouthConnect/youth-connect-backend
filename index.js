//* The main server index includes express app, socket hub, and auth config/secret */

//TODO - Admin features/moderation/control/create rooms and manage them
//Dot env at top just to be safe
require("dotenv").config();

const PORT = process.env.PORT;

const app = require("./server/server.js");
//? Add web socket capability to express server
const http = require("http");
const server = http.createServer(app);
//? create socket server HUB
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require("axios");
const { rooms, messages, userModule, db } = require("./server/models/index.js");

var Filter = require("bad-words");
const filter1 = new Filter();
var filter2 = require("leo-profanity");

const { relayMessage } = require("./socketHandlers/handlerIndex.js");

//?Update this later let roomOptions = await database.get("rooms")
let roomOptions = ["Room1", "Room2", "Room3"];

// TODO When the server starts create the rooms from the database

// await axios.get(/rooms/room1/last10)
let recentMessages = {
  Room1RecentMessages: [
    { user: "John", message: "hello" },
    { user: "Bob", message: "hello" },
  ],
  Room2RecentMessages: [
    { user: "John", message: "hello" },
    { user: "Bob", message: "hello" },
  ],
  Room3RecentMessages: [
    { user: "John", message: "hello" },
    { user: "Bob", message: "hello" },
  ],
};

//pass in the socket(that connected/made a request) to each of these functions
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.onAny((event, payload) => {
    console.log("EVENT:", event, payload);
  });

  socket.on("MESSAGE", async (payload) => {
    // use the middleware
    let cleanWords1 = filter1.clean(payload.text);
    let cleanWords2 = filter2.clean(cleanWords1);
    //* Then send it to the other clients */

    // push the message just submitted
    recentMessages[`${payload.room}RecentMessages`].push({
      text: cleanWords2,
      username: payload.username,
    });

    // create and manage a list of most recent messages //? so they can be displayed in the terminal
    let roomRecentMessages = recentMessages[`${payload.room}RecentMessages`];

    if (roomRecentMessages.length > 10) {
      // remove last message, do nothing with it
      let lastMessage = roomRecentMessages.pop();
    }
    socket
      .to(payload.room)
      // send the individual message sent
      .emit("MESSAGE", { username: payload.username, text: payload.text });

    socket
      .to(payload.room)
      // Send the newly updated recent messages and reprint it when the messages get updated

      .emit(
        "SENDING RECENT MESSAGES",
        recentMessages[`${payload.room}RecentMessages`]
      ); //Room1RecentMessages
    // when server receives a message, make the client start their prompt so it continues the cycle
    socket.emit("GO BACK TO ROOM", {});
    //* Then send it to database */
    try {
      let record = {
        text: payload.text,
        room: payload.room,
        user: payload.user,
      };
      let createdMessage = await axios.post(
        `http://localhost:3001/v1/messages`,
        {
          record,
        }
      );
      console.log("This is the created message:", createdMessage);
    } catch (error) {
      console.log("Error creating collection object:", error.message);
    }
  });

  // handle giving the recent messages to the client
  socket.on("GET RECENT MESSAGES", (payload) => {
    // let messagesFromRoom = await axios.get('v1/messages/from/${payload.room}')
    // payload = "Room1"
    socket.emit(
      "SENDING RECENT MESSAGES",
      recentMessages[`${payload}RecentMessages`]
    ); //Room1RecentMessages
  });

  socket.on("UPDATE USERNAME", (payload) => {
    socket.emit("UPDATE USERNAME", payload);
  });

  socket.on("UPDATE PASSWORD", (payload) => {
    socket.emit("UPDATE PASSWORD", payload);
  });

  socket.on("VERIFY USER", (payload) => {
    socket.emit("GIVE ME YOUR CREDENTIALS", {});
  });

  socket.on("HERES MY CREDENTIALS", (payload) => {
    //TODO transform this to use await axios.post('/signin') and handle that
    // let user = await axios.get('/signin', {payload.userInfo})
    // authenticate(user)
    authenticate(payload);
  });

  // handle join room event
  socket.on("join", (room) => {
    // Verify the room exists
    // let roomOptions = await axios.get('localhost/rooms')
    if (roomOptions.includes(room)) {
      // check if they have permission join
      //? axios.get(userPermsions)? to verify user can join room or the user will have a boolean that says so
      // update the client state with the room name
      socket.emit("UPDATE CURRENT ROOM", room);

      // they join
      socket.join(room);
      console.log(`${socket.id} joined the ${room} room.`);
    } else {
      console.log(`${socket.id} tried to join an invalid room: ${room}`);
    }
  });

  const authenticate = (user) => {
    console.log("authenticated", user.username, user.password);

    //? return the authenticated users's info (includes their token)
    // socket.emit("UPDATE YOUR USER", user)
  };
});

server.listen(PORT, () => {
  // db.sync();
  console.log("listening on *:", PORT);
});

// export the room options so it can be used by the client
module.exports = roomOptions;

/* //? TODO
  socket.on("ADMIN VIEW ROOM", (payload) => {
    get the information about payload.room
    let info = await axios.get('/v1/rooms/roomName')
  })
*/
