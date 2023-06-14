//? require the client terminal to use and execute functions on it

// *Exporting and importing it does not work, pass it into the function

// terminate the custom terminal to exit the process //* Will probably end the whole program. */
const terminate = (term) => {
  term.grabInput(false);
  setTimeout(() => {
    process.exit();
  }, 100);
};

// clear the terminal with the clear function //* moves text to top */
const clearScreen = (term) => {
  term.clear();
};

// clear the terminal with just lines //* moves text to bottom */
const clearWithLines = (term) => {
  term("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
};

// add a new line to the terminal //* can add a dash to the front of the line
const newLine = (term, dash = true) => {
  dash ? term("\n- ") : term("\n");
};

//this will display the introductory text in the terminal-kit

// TODO: this is a good place to introduce the user to the terminal-kit and provide some basic instructions
const mainMenu = (term) => {
  // immediately clear the screen

  clearScreen(term);
  // use the terminal-kit
  // term.green.underline.bgBlack('Heyyy this is the gui!');
  // use our custom basic function to add a newline easily
  newLine(term);
  newLine(term);
  term.magenta("WELCOME TO YOUTH CONNECT");
  newLine(term);
  term.blue('Please press "l" to login');
  newLine(term);
  term.blue('Please press "p" to enter a prompt');
  newLine(term);
  term.blue('Please press "r" to see a list of rooms');
  newLine(term);
  term.blue("Please press ESCAPE to return to main menu");
  newLine(term);
  term.red("in order to close this terminal, CTRL+C or END");
  newLine(term.green);
  newLine(term.red.bold.bgGreen);
  newLine(term, false);
  newLine(term, false); // easily decide whether or not to include that dash
  term(":");
};

// CREATE A ROOM MENU LOG

const roomMenu = (term, selectedRoom) => {
  //? If there is no room say please press r to select a room
  // immediately clear the screen
  clearScreen(term);
  newLine(term);
  newLine(term);
  if (!selectedRoom) {
    term.blue('Please press "r" to see a list of rooms');
  } else {
    term.magenta(`WELCOME TO ${selectedRoom}`);
  }
  newLine(term);
  term.blue('Please press "m" to start a message');
  newLine(term);

  if (selectedRoom) {
    term.blue('Please press "CTRL + r" to see a list of rooms');
  }
  newLine(term);
  term.blue("Please press ESCAPE to return to main menu");
  newLine(term);
};

// create admin menu

const adminMenu = (term) => {

  newLine(term);
  newLine(term);
  term.magenta("WELCOME TO YOUTH CONNECT");
  newLine(term);
  term.brightRed('LOGGED IN AS ADMIN');
  newLine(term);
  term.blue('Please press "r" to view room controls');
  newLine(term);
  term.blue('Please press "u" to see all users connected');
  newLine(term);
  term.blue("Please press ESCAPE to return to main menu");
  newLine(term);
  term.red("in order to close this terminal, CTRL+C or END");
  newLine(term.green);
  newLine(term.red.bold.bgGreen);
  newLine(term, false);
  newLine(term, false); // easily decide whether or not to include that dash
  term(":");
}

const adminRoomsMenu = (term) => {

  clearScreen(term);

  newLine(term);
  newLine(term);
  term.magenta("Room Controls");
  newLine(term);
  term.brightRed('LOGGED IN AS ADMIN');
  newLine(term);
  term.blue('Please press "c" to create rooms');
  newLine(term);
  term.blue('Please press "o" to see a list of rooms');
  newLine(term);
  term.blue('Please press "u" to update rooms');
  newLine(term);
  term.blue('Please press "d" to delete rooms');
  newLine(term);
  term.blue('Please press "v" to view a room by name'); //logs all the users connected
  newLine(term);
  term.blue("Please press ESCAPE to return to main menu");
  newLine(term);
  term.red("in order to close this terminal, CTRL+C or END");
  newLine(term.green);
  newLine(term.red.bold.bgGreen);
  newLine(term, false);
  newLine(term, false); // easily decide whether or not to include that dash
  term(":");
}



module.exports = {
  terminate,
  clearWithLines,
  clearScreen,
  newLine,
  mainMenu,
  roomMenu,
  adminMenu,
  adminRoomsMenu,
};
