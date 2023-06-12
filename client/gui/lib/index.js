//? require the client terminal to use and execute functions on it


// *Exporting and importing it does not work, pass it into the function

// terminate the custom terminal to exit the process //* Will probably end the whole program. */
const terminate = term => {
	term.grabInput(false);
	setTimeout(() => {
		process.exit();
	}, 100);
};

// clear the terminal with the clear function //* moves text to top */
const clearScreen = term => {
	term.clear();
};

// clear the terminal with just lines //* moves text to bottom */
const clearWithLines = term => {
	term('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
};

// add a new line to the terminal //* can add a dash to the front of the line
const newLine = (term, dash = true) => {
	dash ? term('\n- ') : term('\n');
};

//this will display the introductory text in the terminal-kit

// TODO: this is a good place to introduce the user to the terminal-kit and provide some basic instructions
const introduction = term => {
	// immediately clear the screen
	clearScreen(term);
	// use the terminal-kit
	term.green.underline.bgBlack('Heyyy this is the gui!');
	// use our custom basic function to add a newline easily
	newLine(term);
	newLine(term);
	term.magenta('WELCOME TO THE TERMINAL-KIT');
	newLine(term);
	term.blue('Pretty cool huh?');
	newLine(term);
	term.red('in order to close this terminal, right click the mouse');
	newLine(term.green);
	newLine(term.red.bold.bgGreen);
	term.gray(
		'see you can also pass in colors and bold etc to these custom functions easily'
	);
	newLine(term, false);
	newLine(term, false); // easily decide whether or not to include that dash
	term.blue('there is a lot to see');
};

module.exports = {
	terminate,
	clearWithLines,
	clearScreen,
	newLine,
	introduction,
};
