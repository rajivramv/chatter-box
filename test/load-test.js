var net = require('net');

// Some parameters, good practice to declare them as const
const parallelConnections = 1000,
  timeout = 30000;

// describe is a function made available in the global scope when you run this test as 'mocha load-test.js'
describe('Chat server: load test', function(done){

  // This ensures that the mocha tests don't timeout
  this.timeout = 30000;

  // Some variables that we will be using
  var clients = new Map(), connectedClients = 0;

  // This before hook lets you run a piece of code before all the test cases in this describe block
  before('Make parallel connections', function(done){

    // Iterate as many times as the number of parallel connections to make
    for (var i = parallelConnections; i > 0; i--)

      // Connect to the server
      var client = net.connect(...);

      // Usual stuff, *once* the client connects, handle the initial handshake and login protocol
      client.once('connect', handleChatLoginProtocol);

      // I have just chosen this namespaced (generally important) custom event to notify completion of protocol
      // Also note that this 'subscriber pattern' allows me to avoid complex code to call done() once ALL the clients have connected
      client.once('GQMe-login-protocol-completed', handleLogin);

      // You can use an array instead of a Map object.
      clients.set(i, client);

  });

  // Remember that you need to call done() only after we know for certain that all the clients have completed their login protocol.
  function handleLogin(){
    if (++connectedClients === parallelConnections) done();
  }

  // When you reach here, you should be having clients variable filled with logged in clients. Go ahead and have fun!  
  // I have added a few test cases to help you get started 
  it('should be able to send messages from many clients to a single client');
  it('should be able to send a message to a client when that client is sending a message');

})

function handleChatLoginProtocol(){

  // Note that the keyword 'this' in this function when evoked as a 'connect' event handler
  // will refer to the socket which is a stream as well as an event emitter. Hence you can do this.write(..), this.on(...), this.once(...), this.emit(...) etc.
  // to help with handling the protcol.

  // IMPORTANT: Once you complete handling the handshake and login, remember to emit 'GQMe-login-protocol-completed'

  ...

}