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
	console.log(`Params:${util.inspect(req.params)}\nQuery:${util.inspect(req.query)}`);
	res.render('index', {
		messages:[],// messages,
		msgtemplate: msgtemplate
	});
};

server.routes.thread = (req, res) => {
	console.log(`Params:${util.inspect(req.params)}\nQuery:${util.inspect(req.query)}`);
	// let id = req.params.id;
	res.send("woot");
};

server.init = (app, port) => {
	server.app = app;
	app.server = server;
	server.port = port;

	inst.use(express.static(path.join(__dirname, 'public')))
		.set('views', path.join(__dirname, 'views'))
		.set('view engine', 'ejs')
		.get('/', server.routes.index)
		.get('/thread/:id', server.routes.thread);

	socket.on('connection', client => {
		console.log('Client socket connected...');
		client.on('join', data => {
			console.log(data);
		});
		client.on('message', data => {
			console.log(`received ${data}`);
		});
	});


	service.listen(server.port, () => console.log(`Listening on port ${server.port}`));
	return server;
};

module.exports = server;