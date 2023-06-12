//* The main server index includes express app, socket hub, and auth config/secret */

//Dot env at top just to be safe
require('dotenv').config()
const PORT = process.env.PORT;
//? Create express server
const express = require('express');
const app = express();
//? Add web socket capability to express server
const http = require('http');
const server = http.createServer(app);
//? create socket server HUB
const { Server } = require("socket.io");
const io = new Server(server);

//? require Auth0 functions
const { auth, requiresAuth } = require('express-openid-connect');
// Create an AUTH 0 config with our ACTUAL parameters
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: `${process.env.baseURL}`,
  clientID: `${process.env.cliendID}`,
  issuerBaseURL: `${process.env.issuerBaseURL}`,
  secret: `${process.env.secret}`
};


app.use(express.json());

// The `auth` router attaches /login, /logout
// and /callback routes to the baseURL
app.use(auth(config));


app.get('/', (req, res) => {
    res.send(
        req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out'
    )
});

const testRouter = require('./server/server.js')
app.use(testRouter)


const {
    relayMessage
} = require('./socketHandlers/handlerIndex.js');

//pass in the socket(that connected/made a request) to each of these functions
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('SEND MESSAGE', payload => relayMessage(payload, socket));
});

server.listen(PORT, () => {
    console.log('listening on *:', PORT);
});


