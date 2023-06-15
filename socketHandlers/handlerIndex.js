"use strict";

const { newLine } = require("../client/gui/lib");
const axios = require("axios");
const { DataTypes } = require("sequelize");

const changeState = (payload, socket, recentMessages) => {
  socket.emit("CHANGE STATE", payload);
};

const authenticate = (user, socket) => {
  console.log("authenticated", user.username, user.password);

  //? return the authenticated users's info (includes their token)
  socket.emit("UPDATE YOUR USER", { username: user.username, id: 1 }); //! HARD CODED TEMP
};

// HANDLE MESSAGES ON THE SERVER SIDE
const message = async (payload, socket) => {
  if (payload.text !== "") {
    try {
      const currentRoomMessages = `${payload.room}RecentMessages`;

      let cleanWords1 = filter1.clean(payload.text);
      let cleanWords2 = filter2.clean(cleanWords1);

      //* Then send it to the other clients */

      // push the message just submitted
      recentMessages[currentRoomMessages].push({
        text: cleanWords2,
        username: payload.username,
      });

      // create and manage a list of most recent messages //? so they can be displayed in the terminal

      if (recentMessages[currentRoomMessages].length > 10) {
        // remove last message, do nothing with it
        let lastMessage = recentMessages[currentRoomMessages].shift();
        console.log("removed message from last 10:", lastMessage);
      }

      socket
        .to(payload.room)
        // Send the newly updated recent messages and reprint it when the messages get updated

        .emit("SENDING RECENT MESSAGES", recentMessages[currentRoomMessages]); //Room1RecentMessages

      //* Then send it to database */
      let createdMessage = await axios.post(
        `http://localhost:3001/api/v1/messages`,
        {
          text: cleanWords2,
          room: payload.room,
          username: payload.username,
        }
      );

      console.log("This is the created message:", createdMessage.data.text);
    } catch (error) {
      console.log("Error creating collection object:", error.message);
    }
  }
};

const sendMessage = (payload, socket) => {
  socket.emit("SEND MESSAGE", payload);
};

// this ONLY prints a message, and updates its associated state.
const receiveMessage = (term, payload, state, valueToUpdate, socket) => {
  state[valueToUpdate] = payload.valueToUpdate;
  newLine(term);
  term.blue(`${payload.username}:`, payload.text);
};

// This ONLY tells the server i received a message. thats it.
const receivedMessage = (payload, socket) => {
  socket.emit("RECEIVED MESSAGE", payload);
};

const relayMessage = (payload, socket) => {
  // relay the message to everyone BUT THE SENDER
  socket.broadcast.emit("RELAY MESSAGE", payload);
};

const createRoom = async (payload, socket) => {
  let createdRoom = await axios.post(`http://localhost:3001/api/v2/rooms`, {
    name: payload.room,
    users: payload.users,
    description: payload.description,
    minimumAge: payload.minimumAge,
    maxAge: payload.maxAge,
  });
  socket.emit("CREATED ROOM", createdRoom);
};

const getRoomOptions = async () => {
  let roomList = await axios.get("http://localhost:3001/api/v2/rooms");
  return roomList;
};

const deleteRoom = async (payload, socket) => {
  let deletedRoom = await axios.delete(
    `http://localhost:3001/api/v2/rooms/${payload.room}`
  );
  socket.emit("DELETED ROOM", deletedRoom);
};

const updateRoom = async (payload, socket) => {
  let updatedRoom = await axios.put(
    `http://localhost:3001/api/v2/rooms/${payload.room}`,
    {
      name: payload.room,
      users: payload.users,
      description: payload.description,
      minimumAge: payload.minimumAge,
      maxAge: payload.maxAge,
    }
  );
  socket.emit("UPDATED ROOM", updatedRoom);
};

const getRoomUsers = async (payload, socket) => {
  let roomUsers = await axios.get(
    `http://localhost:3001/api/v2/rooms/${payload.room}`
  );
  socket.emit("GOT ROOM USERS", roomUsers);
  console.log("THIS IS THE ROOM INFORMATION", roomUsers);
  return roomUsers.users;
};

const deleteUserInRoom = (usersInRoom, user) => {
  let updatedUsers = usersInRoom.filter((user) => user !== user);
  return updatedUsers;
};

const createUser = async (payload, socket) => {
  let createdUser = await axios.post(
    `http://localhost:3001/api/v2/users`,
    {
    username: payload.username,
    password: payload.password,
    DOB: payload.DOB,
    }
  );
  socket.emit("CREATED USER", createdUser);
  console.log("THIS IS THE CREATED USER------------", createdUser);
  return createdUser;
};


module.exports = {
  sendMessage,
  changeState,
  receiveMessage,
  receivedMessage,
  relayMessage,
  authenticate,
  message,
  createRoom,
  createUser,
  getRoomOptions,
  deleteRoom,
  updateRoom,
  getRoomUsers,
  deleteUserInRoom,
};
