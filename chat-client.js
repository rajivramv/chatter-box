var net 	= require('net'),
	client 	= net.connect(3000,'localhost'),
	createReadStream = require('fs').createReadStream,
	nick 	= /(\/nick)( )(.*)/;

// ---- Logic to check if the server accepted the nickname ---- //

// Set the encoding of the socket so that we get strings as chunk instead of buffer
client.setEncoding('utf8')

// When we connect and the server sends a welcome message, simply write it to terminal and then 
// set up a logic that verifies if the server accepted the nickname 
client.once('data',writeToTerminalAndSetupServerSideNickNameLogic);

// the one time event handler that writes the welcome message to terminal and then setus up a logic that verifies
// if the server has accepted the nickname or not. This logic is invoked whenever we get some data from the server
function writeToTerminalAndSetupServerSideNickNameLogic(chunk){
	process.stdout.write(chunk);
	client.on('data',checkForNickNameSuccessMessageFromServer);
}

// The logic that verifies if the server has accepted the nickname or not
function checkForNickNameSuccessMessageFromServer(chunk){

	// We do a simple pattern matching, may not be the appropriate way
	if (chunk === 'Your nick name is registerd! You can now chat with others!\n'){
		
		// If we are here, it means the the server accepted the nickname
		// 'this' refers to the client socket. We can go ahead and stop checking the messages from the server
		this.removeListener('data',checkForNickNameSuccessMessageFromServer);

		// We can also stop monitoring the stdin as now the nickname has been approved by the server 
		process.stdin.removeListener('data',registerNicknameLogic);

		// Go ahead and pipe both ways
		// Client -> Terminal
		// Terminal -> Client 
		this.pipe(process.stdout);
		process.stdin.pipe(client);

	} 
	// In whichever case, success (above) or failure to register a nickname, we write the corressponding message to 
	// stdout
	process.stdout.write(chunk);
} 
// ---- //

// ---- Logic to check if the user is providing the nickname upfront  ---- //

// We will do a client side validation that the first thing the user should do is to register a nickname
process.stdin.on('data',registerNicknameLogic)

// The logic that verifies if the client is sending the correct command
function registerNicknameLogic(chunk){

	// Regular expression testing
	if (!nick.test(chunk)){

		// Pipe a error message that a nick name is needed back to the terminal
		createReadStream('./assets/nick/errors/nick-name-needed.txt')
			.once('close',_unpipeStream)
			.pipe(process.stdout, {end:false});
	} else {

		// If the input conforms to the nickname command, write to the client
		 client.write(chunk);
	}
}

function _unpipeStream(){
	this.unpipe();
}
// ---- //