const fs = require('fs');
const login = require('facebook-chat-api');
const facebook = {};

facebook.onMessage = (err, msg) => {
	if (err) return console.error(err);
	if (!msg.type=="message") return;
	let user = threads[msg.threadID].participants[msg.senderID]
	console.log(`got ${msg.timestamp}`);	
	facebook.app.server.pushMessage({
		name: user.name,
		content: msg.body,
		avatar: user.profilePicture,
		timestamp: new Date(parseInt(msg.timestamp)).toLocaleTimeString("en-us")
	});
};

facebook.updateThreads = () => {
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

facebook.init = (app) => {
	facebook.app = app;
	app.facebook = facebook;
	let token = require('./token.json');
	let creds = {email: token.email, password: token.password};
	if (fs.existsSync('appstate.json')) {
		console.log("Logging in with cookies");
		creds = {appState:JSON.parse(fs.readFileSync('appstate.json','utf8'))};
	}
	login(creds, (err, api) => {
		if (err) {
			console.error(`Error loggin into facebook: ${err}`);
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