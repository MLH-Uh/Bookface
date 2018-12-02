const server = {};
const fs = require('fs');
const path = require('path');
const util = require('util');

const express = require('express')
const inst = express();
const service = require('http').createServer(inst);
const socket = require('socket.io')(service);

const msgtemplate = fs.readFileSync('views/message.ejs', 'utf-8');

server.pushMessage = (msg) => {
	socket.emit('message', msg);
};

server.routes = {};
server.routes.index = (req, res) => {
	console.log('[Server] Routing index request');
	console.log(`Params:${util.inspect(req.params)}\nQuery:${util.inspect(req.query)}`);
	res.render('index', {
		messages:[],// messages,
		msgtemplate: msgtemplate
	});
};

server.routes.thread = async (req, res) => {
	console.log('[Server] Routing thread request');
	console.log(`Params:${util.inspect(req.params)}\nQuery:${util.inspect(req.query)}`);
	try {
		res.render('thread', {
			messages: await server.app.facebook.getThreadMessages(req.params.id),
			msgtemplate: msgtemplate,
			threadID: req.params.id
		});
	} catch (e) {
		res.send("503");
	}
};

server.init = (app, port) => {
	console.log('[Server] Initializing...');
	server.app = app;
	app.server = server;
	server.port = port;

	inst.use(express.static(path.join(__dirname, 'public')))
		.set('views', path.join(__dirname, 'views'))
		.set('view engine', 'ejs')
		.get('/', server.routes.index)
		.get('/thread/:id', server.routes.thread);

	socket.on('connection', client => {
		console.log('[Socket] Client socket connected...');
		client.on('join', data => {
			console.log(`[Socket] Received ${data}`);
		});
		client.on('message', data => {
			console.log(`[Socket] Message send request ${util.inspect(data)}`);
			server.app.facebook.sendMessage(data.body, data.threadID);
			server.app.facebook.onMessage(null, {
				threadID: data.threadID, 
				body: data.body,
				senderID: server.app.facebook.api.getCurrentUserID(),
				timestamp: new Date().getTime()
			});
		});
	});


	service.listen(server.port, () => console.log(`[Server] Listening on port ${server.port}`));
	return server;
};

module.exports = server;