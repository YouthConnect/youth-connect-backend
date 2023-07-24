"use strict";

const axios = require("axios");

const Filter = require("bad-words");
const filter1 = new Filter();
const filter2 = require("leo-profanity");
const { imageModule } = require("../server/models");

// HANDLE MESSAGES ON THE SERVER SIDE
const message = async (payload, socket, isImage, recentMessages) => {
  if (payload.text !== "") {
    try {
      let newMessage = {};

      const currentRoomMessages = `${payload.room}RecentMessages`;
      //if the message (room specific) queue doesn't exist create it
      if (!recentMessages[currentRoomMessages]) {
        recentMessages[currentRoomMessages] = [];
      }

      if (isImage) {
        newMessage = {
          text: "Image " + payload.image.uri,
          username: payload.username,
          room: payload.room,
        };
      } else {
        let cleanWords1 = filter1.clean(payload.text);
        let cleanWords2 = filter2.clean(cleanWords1);

        newMessage = {
          text: cleanWords2,
          room: payload.room,
          username: payload.username,
        };
      }

      //* Then send it to the other clients */

      // push the message just submitted
      recentMessages[currentRoomMessages].push(newMessage);

      // create and manage a list of most recent messages //? so they can be displayed in the terminal

      if (recentMessages[currentRoomMessages].length > 30) {
        // remove last message, do nothing with it
        let lastMessage = recentMessages[currentRoomMessages].shift();
        console.log("removed message from last 30:", lastMessage);
      }

      if (!isImage) {
        socket.to(payload.room).emit("NEW MESSAGE", newMessage);
      } else {
        socket.in(payload.room).emit("NEW MESSAGE", newMessage);
      }
      //* Then send it to database */
      try {
        if (isImage) {
          try {
            const imageRecord = await imageModule.create(payload);
            // send image back to everyone
            console.log("Image Record created!");
          } catch (error) {
            console.log("Error creating new image", error);
          }
        } else {
          try {
            let createdMessage = await axios.post(
              `http://localhost:3001/api/v1/messages`,
              newMessage
            );
            console.log(
              "This is the created message:",
              createdMessage.data.text
            );
          } catch (error) {
            console.log("ERROR CREATING MESSAGE", error);
          }
        }
      } catch (error) {
        console.log("ERROR ADDING MESSAGE OR IMAGE TO DATABASE:", error);
      }
    } catch (error) {
      console.log("Error creating collection object:", error);
    }
  }
};

const createRoom = async (payload, socket) => {
  let createdRoom = await axios.post(`http://localhost:3001/api/v1/rooms`, {
    name: payload.name,
    users: payload.users,
    description: payload.description,
    minimumAge: payload.minimumAge,
    maxAge: payload.maxAge,
  });
  // ...
};

const getRoomOptions = async () => {
  let roomList = await axios.get("http://localhost:3001/api/v1/rooms");
  return roomList;
};

const deleteRoom = async (payload) => {
  let deletedRoom = await axios.delete(
    `http://localhost:3001/api/v2/rooms/${payload.room}`
  );
  // ...
};

const updateRoom = async (payload, socket) => {
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
  // ...
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
  let createdUser = await axios.post(`http://localhost:3001/api/v1/users`, {
    username: payload.username,
    password: payload.password,
    DOB: payload.DOB,
  });
  socket.emit("CREATED USER", createdUser);
  console.log("THIS IS THE CREATED USER------------", createdUser);
  return createdUser;
};

const getUsers = async (payload, socket) => {
  let getAllUsers = await axios.get(`http://localhost:3001/api/v1/users`);
  socket.emit("GET ALL USERS", getAllUsers.data);
  console.log("THIS IS ALL USERS------", getAllUsers.data);
  return getAllUsers.data;
};

module.exports = {
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
