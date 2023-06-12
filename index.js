//* The main server index includes express app, socket hub, and auth config/secret */

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { auth, requiresAuth } = require('express-openid-connect');

const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: 'http://localhost:3000',
    clientID: '{yourClientId}',
    issuerBaseURL: 'https://{yourDomain}',
    secret: 'LONG_RANDOM_STRING'
};

// The `auth` router attaches /login, /logout
// and /callback routes to the baseURL
app.use(auth(config));

app.get('/', (req, res) => {
    res.send(
        req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out'
    )
});

// The /profile route will show the user profile as JSON
app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user, null, 2));
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
