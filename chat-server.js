// In JS you can get assign a function to a variable like here
var createReadStream 	= require('fs').createReadStream,
	server 				= require('net').createServer(),
	nick 				= /(\/nick)( )(.*)/,

	// A string formatting function like printf
	format 				= require('util').format,
	users 				= new Map();

server.on('connection',function(socket){

	// Set the encoding
	socket.setEncoding('utf8');

	// Pipe a welcome message to the socket
	createReadStream('./assets/welcome.txt')
		.once('close',_unpipeStream)
		.pipe(socket, {end:false});
	
	socket.on('data', registerUser);
});


function registerUser(chunk){

	// nickTest will be an array if it the RegExp exec passes
	var nickTest = nick.exec(chunk) 

	// In JS, arrays are 'truthy'
	if (nickTest){

		var nickName = nickTest[3];
		
		// Check if nickname is already chosen, that is, if it exists in the users map
		if (!users.has(nickName)){

			// If we are here, then the nick name is valid, that is, it is not taken by anyone
			// We will notify everyone about the new user
			broadcastUserJoining(nickName);

			// Store the nickname as a property of socket too which will be helpful later
			this.nickName = nickName;

			createReadStream('./assets/nick/nick-success.txt')
				.once('close',_unpipeStream)
				.pipe(this, {end:false}) 
				.once('unpipe', sendUserNickNameList)
				.once('unpipe', addToUsersList)
				.once('close', removeFromUsersList)
				.on('data', broadcastMessage)
				.removeListener('data',registerUser);
				
		} else {

			// If we are here, then the nickname is already chosen.
			// Notify the user
			createReadStream('./assets/nick/errors/nick-name-already-chosen.txt')
				.once('close',_unpipeStream)
				.pipe(this, {end:false});
		}
	} else {

		// If we are here, then it means that the nickTest failed - which means the user didn't do the /nick command. So 
		// go ahead and let the user know that.
		createReadStream('./assets/nick/errors/nick-name-needed.txt')
			.once('close',_unpipeStream)
			.pipe(this, {end:false});
	}
}

function _unpipeStream(){
	this.unpipe();
}

function broadcastUserJoining(newUserNickName){
	users.forEach(function(socket){
		socket.write(format('%s joined!\n',newUserNickName));
	});

}

function sendUserNickNameList(){
	var nickNames = [],
		keysIter = users.keys(),
		i = 0;
	for (;i<users.size;i++){
		nickNames.push(keysIter.next().value);
	}
	this.write(format('People already in the chat room: %s (%d)\n',nickNames.join(', '),nickNames.length));
}

function addToUsersList(){
	users.set(this.nickName,this);
}

function removeFromUsersList(){
	users.delete(this.nickName);
}

function broadcastMessage(chunk){
	users.forEach(function(socket,nickName){
		if (this.nickName !== nickName){
			socket.write(format('%s> %s',this.nickName,chunk));
		} 
	},this);
}

server.once('listening', function(){
	console.log('Server listening on port 3000');
})

server.listen('3000');