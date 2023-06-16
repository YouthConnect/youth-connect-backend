"use strict";

const { newLine } = require("../client/gui/lib");
const axios = require("axios");
const base64 = require('base-64');

const Filter = require("bad-words");
const filter1 = new Filter();
const filter2 = require("leo-profanity");
const { DataTypes } = require("sequelize");


const changeState = (payload, socket, recentMessages) => {
  socket.emit("CHANGE STATE", payload);
};

const authenticate = async (user, socket) => {
  try {
    //base64 encode the data in format '${user}:${pass}'
    let formattedData = base64.encode(`${user.username}:${user.password}`);
    // send properly formated data to signin route //* in the authorization header as `Basic ${formatedData}`*/
    let validatedUser = await axios.post('http://localhost:3001/signin', {}, { headers: { Authorization: `Basic ${formattedData}` } });

    //? return the authenticated users's info (includes their token)
    socket.emit("UPDATE YOUR USER", validatedUser.data.user);
  } catch (error) {
    console.log(error.message)
  }
};

// HANDLE MESSAGES ON THE SERVER SIDE
const message = async (payload, socket, recentMessages) => {
  if (payload.text !== "") {
    try {

      const currentRoomMessages = `${payload.room}RecentMessages`;
      //recentMessages[whatever we wnated it to be] = what we wantit to equal
      //if the message (room specific) queue doesn't exist create it
      if (!recentMessages[currentRoomMessages]) {
        recentMessages[currentRoomMessages] = []
      }


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

const createRoom = async (payload, socket) => {
  try {
    let createdRoom = await axios.post(`http://localhost:3001/api/v1/rooms`, {
      name: payload.name,
      users: payload.users,
      description: payload.description,
      minimumAge: payload.minimumAge,
      maxAge: payload.maxAge,
    });
    socket.emit("CREATED ROOM", createdRoom.data);

  } catch (error) {
    console.log(error.message);
  }
};

const getRoomOptions = async () => {
  try {
    let roomList = await axios.get("http://localhost:3001/api/v1/rooms");
    return roomList;

  } catch (error) {
    console.log(error.message);
  }
}

const deleteRoom = async (payload, socket) => {
  try {
    let deletedRoom = await axios.delete(
      `http://localhost:3001/api/v2/rooms/${payload.room}`
    );
    socket.emit("DELETED ROOM", deletedRoom);

  } catch (error) {
    console.log(error.message);
  }
};

const updateRoom = async (payload, socket) => {
  try {
    let updatedRoom = await axios.put(
      `http://localhost:3001/api/v1/rooms/${payload.room}`,
      {
        name: payload.room,
        users: payload.users,
        description: payload.description,
        minimumAge: payload.minimumAge,
        maxAge: payload.maxAge,
      }
    );
    socket.emit("UPDATED ROOM", updatedRoom);

  } catch (error) {
    console.log(error.message);
  }
};

const getRoomUsers = async (payload, socket) => {
  try {
    let roomUsers = await axios.get(
      `http://localhost:3001/api/v2/rooms/${payload.room}`
    );
    socket.emit("GOT ROOM USERS", roomUsers);
    console.log("THIS IS THE ROOM INFORMATION", roomUsers);
    return roomUsers.users;

  } catch (error) {
    console.log(error.message);
  }
};

const deleteUserInRoom = (usersInRoom, user) => {
  let updatedUsers = usersInRoom.filter((user) => user !== user);
  return updatedUsers;
};

const createUser = async (payload, socket) => {
  try {
    let createdUser = await axios.post(
      `http://localhost:3001/api/v1/users`,
      {
        username: payload.username,
        password: payload.password,
        DOB: payload.DOB,
      }
    );
    socket.emit("CREATED USER", createdUser);
    console.log("THIS IS THE CREATED USER------------", createdUser);
    return createdUser;

  } catch (error) {
    console.log(error.message);
  }
};

const getUsers = async (payload, socket) => {
  try {
    let getAllUsers = await axios.get(
      `http://localhost:3001/api/v1/users`,
    );
    socket.emit("GET ALL USERS", getAllUsers.data);
    console.log("THIS IS ALL USERS------", getAllUsers.data);
    return getAllUsers.data;

  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
  sendMessage,
  changeState,
  authenticate,
  message,
  createRoom,
  createUser,
  getUsers,
  getRoomOptions,
  deleteRoom,
  updateRoom,
  getRoomUsers,
  deleteUserInRoom,
};
