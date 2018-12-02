const fs = require('fs');
const util = require('util');
const login = require('facebook-chat-api');
const facebook = {};

facebook.onMessage = (err, msg) => {
	if (err) return console.error(err);
	if (!msg.type=='message') return;
	console.log(`[Facebook] Received message "${msg.body}"`);
	if (msg.body == 'wee') console.log(util.inspect(msg));
	let user = facebook.threads[msg.threadID].participants[msg.senderID]
	console.log(`got ${msg.timestamp}`);	
	facebook.app.server.pushMessage({
		name: user.name,
		content: msg.body,
		avatar: user.profilePicture,
		timestamp: new Date(parseInt(msg.timestamp)).toLocaleTimeString('en-us')
	});
};

facebook.sendMessage = (content, id) => {
	facebook.api.sendMessage(content, id);
};

facebook.updateThreads = () => {
	console.log('[Facebook] Updating threads');
	facebook.api.getThreadList(5, null, [], (err, list) => {
		facebook.threads = {};
		for (let thread of list) {
			let p = thread.participants; 
			thread.participants = {};
			for (let v of p) {
				thread.participants[v.userID] = v;
			}
			facebook.threads[thread.threadID] = thread;
		}
	});
};

facebook.getThreadMessages = (id) => {
	console.log(`[Facebook] Fetching messages for thread "${id}"`);
	return new Promise((resolve, reject) => {
		facebook.api.getThreadHistory(id, 50, null, (err, history) => {
	        if(err) return reject(err);
			let rtn = [];
			for (let msg of history) {
				let user = facebook.threads[id].participants[msg.senderID];
				rtn.push({
					name: user.name,
					content: msg.body,
					avatar: user.profilePicture,
					timestamp: new Date(parseInt(msg.timestamp)).toLocaleTimeString('en-us')
				});
			}
	        resolve(rtn);
	    });
	});
};

facebook.init = (app) => {
	console.log('[Facebook] Initializing...');
	facebook.app = app;
	app.facebook = facebook;
	let token = require('./token.json');
	let creds = {email: token.email, password: token.password};
	if (fs.existsSync('appstate.json')) {
		console.log('[Facebook] Logging in with cookies');
		creds = {appState:JSON.parse(fs.readFileSync('appstate.json','utf8'))};
	}
	login(creds, (err, api) => {
		if (err) {
			console.error(`[Facebook] Error loggin in: ${err}`);
			process.exit();
		}
		facebook.api = api;
	    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
		facebook.updateThreads();
		api.listen(facebook.onMessage);
	});
	return facebook;
};

module.exports = facebook;