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


const {
  relayMessage,
  message,
  authenticate,
  verifyRoom,
  createRoom,
  getRoomOptions,
  deleteRoom,
  updateRoom,
  getRoomUsers,
  deleteUserInRoom,
} = require("./socketHandlers/handlerIndex.js");

const { Statement } = require("sqlite3");

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

  /* //?------------------------------ HANDLE ROOMS ------------------------------ */
  //! IF THIS ISN"T AWAITED AFTER MERGING PLEASE AWAIT IT
  socket.on("CREATE ROOM", (payload) => {
    //TODO - create a room in the database
    createRoom(payload, socket);
    //TODO - update the room options
    let roomList = getRoomOptions();
    //TODO - send the updated room options to the client

    socket.emit("UPDATED ROOMS", roomList);
  });

  socket.on("GIVE ME UPDATED ROOMS", async (payload) => {
    let roomList = await getRoomOptions();
    socket.emit("UPDATED ROOMS", roomList.data);
  });

  // TODO handle join room event

  socket.on("join", async (payload) => {
    let roomList = await getRoomOptions();
    let today = new Date();
    let age = today.getFullYear() - parseInt(payload.user.DOB.split("/"));

    if (payload.room === "admins") {
      socket.join(payload.room);
    }
      // check if they have permission join
      if (age > 10) {
        console.log("You can enter this room");
        socket.emit("UPDATE CURRENT ROOM", payload.room);
        socket.join(payload.room);
        console.log(`${socket.id} joined the ${payload.room} room.`);
      } else {
        console.log("you cant enter");
      }

  });

  // when user leaves a room leave it
  socket.on('leave', payload => {
    socket.leave(payload)
  })

  // TODO add a user to a room
  socket.on("ADD USER TO ROOM", (payload) => {
    //TODO - update the users in the room
    let getUsersInRoom = getRoomUsers(payload, socket);
    let updatedUsers = getUsersInRoom.push(payload.user);
    let newPayload = { room: payload.room, users: updatedUsers };
    //TODO - update the room options
    let newRoomOptions = updateRoom(newPayload, socket);
    //TODO - send the updated room options to the client
    socket.emit("UPDATED ROOM OPTIONS", newRoomOptions);
  });

  //TODO - handle delete room event
  socket.on("DELETE ROOM", (payload) => {
    //TODO - delete the room from the database
    deleteRoom(payload, socket);
    //TODO - update the room options
    let roomList = getRoomOptions();
    //TODO - send the updated room options to the client
    socket.emit("UPDATED ROOMS", roomList);
  });

  //TODO - handle update room event
  socket.on("UPDATE ROOM", (payload) => {
    //TODO - update the room in the database
    let newRoomOptions = updateRoom(payload, socket);
    //TODO - send the updated room options to the client
    socket.emit("UPDATED ROOM OPTIONS", newRoomOptions);
  });

  //TODO - handle leave room event
  socket.on("LEAVE ROOM", (payload) => {
    //TODO - update the users in the room
    let getUsersInRoom = getRoomUsers(payload, socket);
    let updatedUsers = deleteUserInRoom(getUsersInRoom, payload.user);
    let newPayload = { room: payload.room, users: updatedUsers };
    //TODO - update the room options
    updateRoom(newPayload, socket);

    //TODO - send the updated room options to the client
    socket.emit("LEFT ROOM ", payload.user);
  });

  /* //?----------------------------- HANDLE MESSAGES ---------------------------- */

  socket.on("MESSAGE", async (payload) => {
    // use the 'middleware'
    await message(payload, socket, recentMessages);

    // when server receives a message, make the client start their prompt so it continues the cycle
    socket.emit("GO BACK TO ROOM", {});
  });

  // handle giving the recent messages to the client
  socket.on("GET RECENT MESSAGES", (payload) => {
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
