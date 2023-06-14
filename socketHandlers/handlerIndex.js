"use strict";

const { newLine } = require("../client/gui/lib");

const changeState = (payload, socket, recentMessages) => {
  socket.emit("CHANGE STATE", payload);
};

const authenticate = (user) => {
  console.log("authenticated", user.username, user.password);

  //? return the authenticated users's info (includes their token)
  // socket.emit("UPDATE YOUR USER", user)
};

//! IF THIS DOESN'T WORK PUT IT BACK INTO INDEX
const verifyRoom = (room, socket) => {
  // Verify the room exists
  // let roomOptions = await axios.get('localhost/rooms')
  if (roomOptions.includes(room)) {
    // check if they have permission join
    // axios.get(userPermsions)? to verify user can join room or the user will have a boolean that says so
    // update the client state with the room name
    socket.emit("UPDATE CURRENT ROOM", room);

    // they join
    clientSocket.join(room);
    console.log(`${serverSocket.id} joined the ${room} room.`);
  } else {
    console.log(`${socket.id} tried to join an invalid room: ${room}`);
  }
}

// HANDLE MESSAGES ON THE SERVER SIDE
const message = async (payload, socket) => {
  if (payload.text !== '') {
    try {
      const currentRoomMessages = `${payload.room}RecentMessages`

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
        console.log('removed message from last 10:', lastMessage)
      }

      socket
        .to(payload.room)
        // Send the newly updated recent messages and reprint it when the messages get updated

        .emit(
          "SENDING RECENT MESSAGES",
          recentMessages[currentRoomMessages]
        ); //Room1RecentMessages

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
}

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

const createRoom = async(payload, socket) => {
  let createdRoom = await axios.post(
    `http://localhost:3001/api/v1/rooms`,
    {
      name: payload.room,
      users: payload.users,
      description: payload.description,
      minimumAge: payload.minimumAge,
      maxAge: payload.maxAge
    }
  );
  socket.emit("CREATED ROOM", createdRoom);
};

const getRoomOptions = async() => {
  let roomList = await axios.get('http://localhost:3001/api/v1/rooms')
  return roomList
}

const deleteRoom = async(payload, socket) => {
  let deletedRoom = await axios.delete(
    `http://localhost:3001/api/v1/rooms/${payload.room}`);
  socket.emit("DELETED ROOM", deletedRoom);
};

const updateRoom = async(payload, socket) => {
  let updatedRoom = await axios.put(
    `http://localhost:3001/api/v1/rooms/${payload.room}`,
    {
      name: payload.room,
      users: payload.users,
      description: payload.description,
      minimumAge: payload.minimumAge,
      maxAge: payload.maxAge
    }
  );
  socket.emit("UPDATED ROOM", updatedRoom);
};


module.exports = {
  sendMessage,
  changeState,
  receiveMessage,
  receivedMessage,
  relayMessage,
  authenticate,
  verifyRoom,
  createRoom,
  getRoomOptions,
  deleteRoom,
  updateRoom
};
