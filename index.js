//* The main server index includes express app, socket hub, and auth config/secret */

//TODO - fix menu state, create rooms, login logout states with messages and prompts. join room state, go back to menu state
//TODO - Admin features/moderation/control/create rooms and manage them
//Dot env at top just to be safe
require("dotenv").config();
const PORT = process.env.PORT;
//? Create express server
const express = require("express");
const app = express();
//? Add web socket capability to express server
const http = require("http");
const server = http.createServer(app);
//? create socket server HUB
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.json());

//? Above the auth becausewe don't want any auth stuff here for now during testing.
const v1 = require('./server/routes/v1')
app.use("/v1", v1);


app.get("/", (req, res) => {
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

const testRouter = require("./server/server.js");
app.use(testRouter);

const { relayMessage } = require("./socketHandlers/handlerIndex.js");

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
    socket.emit("RESTART MESSAGE PROMPT", {});
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



const authenticate = (payload) => {
  console.log("authenticated", payload.username, payload.password);
};

});

server.listen(PORT, () => {
  console.log("listening on *:", PORT);
});
