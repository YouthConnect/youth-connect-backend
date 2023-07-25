//* The main server index includes express app, socket hub, and auth config/secret */

require("dotenv").config();

const PORT = process.env.PORT;

const app = require("./server/server.js");
//? Add web socket capability to express server
const http = require("http");
const server = http.createServer(app);
//? create socket server HUB
const { Server } = require("socket.io");
const io = new Server(server);
const { db } = require("./server/models/index.js");

const { message } = require("./socketHandlers/handlerIndex.js");

//create a feed of only the most recent messages from the database in real time
let recentMessages = {};

//pass in the socket(that connected/made a request) to each of these functions
io.on("connection", (socket) => {
  socket.onAny((event, payload) => {
    console.log("EVENT:", event, payload);
  });

  socket.on("GET_CONNECTED_USERS", (payload) => {
    // to ALL USERS -> tell me you are here
    socket.broadcast.emit("TELL ME YOU ARE HERE", {});
  });

  socket.on("I AM HERE", (username) => {
    socket.to("admins").emit("IM HERE ADMINS", username);
  });

  socket.on("join", async (payload) => {
    socket.join(payload.room);
  });

  // when user leaves a room leave it
  socket.on("leave", (payload) => {
    socket.leave(payload);
  });

  /* //?----------------------------- HANDLE MESSAGES ---------------------------- */

  socket.on("MESSAGE", async (payload) => {
    // use the 'middleware'
    console.log("new message: ", payload);
    await message(payload, socket, payload.isImage, recentMessages);
  });

  socket.on("DELETE_MESSAGE", async (payload) => {
    let currentRoom = `${payload.room}RecentMessages`;
    console.log(recentMessages[currentRoom]);
    recentMessages[currentRoom].splice(payload.messageId, 1);
  });

  // handle giving the recent messages to the client
  socket.on("GET RECENT MESSAGES", (payload) => {
    let messagePayload;
    if (!recentMessages[`${payload}RecentMessages`]) {
      messagePayload = [];
    } else {
      messagePayload = recentMessages[`${payload}RecentMessages`];
    }

    socket.emit("SENDING RECENT MESSAGES", messagePayload); //Room1RecentMessages
  });

  /* //?------------------------------- USER LOGIN ------------------------------- */
});

//* Sync the database and start the server */

db.sync().then(() => {
  server.listen(PORT, () => {
    console.log("listening on *:", PORT);
  });
});

module.exports = server;
