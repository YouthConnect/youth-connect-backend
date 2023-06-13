//* The main server index includes express app, socket hub, and auth config/secret */

//TODO - fix menu state, create rooms, login logout states with messages and prompts. join room state, go back to menu state
//TODO - Admin features/moderation/control/create rooms and manage them
//Dot env at top just to be safe
require("dotenv").config();
const PORT = process.env.PORT;

const { app } = require('./server/server.js')
//? Add web socket capability to express server
const http = require("http");
const server = http.createServer(app);
//? create socket server HUB
const { Server } = require("socket.io");
const io = new Server(server);

// const testRouter = require("./server/server.js");
// app.use(testRouter);

const { relayMessage } = require("./socketHandlers/handlerIndex.js");

// define global variables

//?Update this laterlet roomOptions = await database.get("rooms")
let roomOptions = [
  'Room1',
  'Room2',
  'Room3'
];

//pass in the socket(that connected/made a request) to each of these functions
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.onAny((event, payload) => {
    console.log("EVENT:", event, payload);
  });

  socket.on("SEND MESSAGE", (payload) => relayMessage(payload, socket));
  socket.on("BASIC INPUT", (payload) => {
    socket.emit("UPDATE VALUE", payload);
  });
  socket.on("MESSAGE", (payload) => {
    //console.log("RECEIVED MESSAGE", payload);
    socket.broadcast.emit("MESSAGE", payload);
    // when server receives a message, make the client start their prompt so it continues the cycle
    socket.emit("GO BACK TO ROOM", {});
  });

  socket.on('UPDATE USERNAME', payload => {
    socket.emit("UPDATE USERNAME", payload)
  });

  socket.on('UPDATE PASSWORD', payload => {
    socket.emit("UPDATE PASSWORD", payload)
  });

  socket.on("VERIFY USER", (payload) => {
    socket.emit("GIVE ME YOUR CREDENTIALS", {})
  })

  socket.on("HERES MY CREDENTIALS", payload => {
    authenticate(payload)

  });

  // handle join room event
  socket.on('join', (room) => {
    if (roomOptions.includes(room)) {
      // check if they have permission join

      // update the client state with the room name
      socket.emit('UPDATE CURRENT ROOM', room)


      // they join
      socket.join(room);
      console.log(`${socket.id} joined the ${room} room.`);
    } else {
      console.log(`${socket.id} tried to join an invalid room: ${room}`);
    }

  });

  const authenticate = (payload) => {
    console.log("authenticated", payload.username, payload.password);
  }

});




server.listen(PORT, () => {
  console.log("listening on *:", PORT);
});

// export the room options so it can be used by the client
module.exports = roomOptions
