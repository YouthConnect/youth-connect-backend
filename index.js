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
const { db } = require("./server/models/index.js");

var Filter = require("bad-words");
const filter1 = new Filter();
var filter2 = require("leo-profanity");

const { relayMessage, message, authenticate, verifyRoom , createRoom, getRoomOptions} = require("./socketHandlers/handlerIndex.js");

//?Update this later let roomOptions = await database.get("rooms")
let roomOptions = ["Room1", "Room2", "Room3"];

// TODO When the server starts create the rooms from the database

// await axios.get(/rooms/room1/last10)
//create a feed of only the most recent messages from the database in real time
let recentMessages = {
  Room1RecentMessages: [
    { username: "John", text: "hello" },
    { username: "Bob", text: "hello" },
    { username: "John", text: "how are you?" },
    { username: "Bob", text: "good, you?" },
    { username: "John", text: "im good" },
    { username: "Bob", text: "great!" },
  ],
  Room2RecentMessages: [
    { username: "John", text: "hello" },
    { username: "Bob", text: "hello" },
  ],
  Room3RecentMessages: [
    { username: "John", text: "hello" },
    { username: "Bob", text: "hello" },
  ],
};

//pass in the socket(that connected/made a request) to each of these functions
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.onAny((event, payload) => {
    console.log("EVENT:", event, payload);
  });

/* //?------------------------------ HANDLE ROOMS ------------------------------ */
socket.on("CREATE ROOM", (payload) => {
  //TODO - create a room in the database
  createRoom(payload, socket)
  //TODO - update the room options
  let roomList=getRoomOptions()
  //TODO - send the updated room options to the client

  socket.emit("UPDATED ROOMS", roomList);
});

  socket.on("GIVE ME UPDATED ROOMS", (payload) => {
    //axios get request for all of the rooms in the database
    // for now send hard coded rooms
    socket.emit("UPDATED ROOMS", roomOptions)
  })

  // handle join room event
  socket.on("join", (room) => {
    let user = verifyRoom(room, socket)

    // update the user
  });

/* //?----------------------------- HANDLE MESSAGES ---------------------------- */

  socket.on("MESSAGE", async (payload) => {
    // use the 'middleware'
    await message(payload, socket, recentMessages)

    // when server receives a message, make the client start their prompt so it continues the cycle
    socket.emit("GO BACK TO ROOM", {});
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

/* //?------------------------------- USER LOGIN ------------------------------- */

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
    authenticate(payload, socket);
  });




});

//* Sync the database and start the server */

db.sync().then(() => {
  server.listen(PORT, () => {
    console.log("listening on *:", PORT);
  });
});


/* //? TODO
  socket.on("ADMIN VIEW ROOM", (payload) => {
    get the information about payload.room
    let info = await axios.get('/v1/rooms/roomName')
  })
*/
