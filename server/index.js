const express = require('express')
const ws = require('ws')

const app = express();


// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });

wsServer.broadcast = function(data) {
	wsServer.clients.forEach(client => client.send(data));
};

wsServer.on('connection', socket => {
	socket.on('message', message => {
		console.log(message)
		if(message == 'HELL') {
			console.log('Hell cometh')
			// socket.send(message)
			wsServer.broadcast(message)
		} else {
			wsServer.broadcast(message)
		}
	});
});


// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
	wsServer.handleUpgrade(request, socket, head, socket => {
		wsServer.emit('connection', socket, request);
	});
});