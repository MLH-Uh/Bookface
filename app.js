const fs = require('fs');
const path = require('path');
const login = require('facebook-chat-api');
const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const token = require('./token.json');
const port = 3000



let messages = [
	{name: "Oof", content: "woot", avatar:"https://i.imgur.com/VWcKTrh.jpg"},
	{name: "Oof", content: "boot", avatar:"https://i.imgur.com/VWcKTrh.jpg"},
	{name: "Oof", content: "doot", avatar:"http://www.veggieonapenny.com/wp-content/uploads/2013/11/vegan-cheese-3-1024x731.jpg"}
];

let msgtemplate;
fs.readFile('views/message.ejs', 'utf-8', (err, tem) => {
	msgtemplate = tem;
});

let creds;
if (fs.exists("appstate.json")) { 
	creds = require('./appstate.json');
} else {
	creds = {email: token.email, password: token.password};
}
login(creds, (err, api) => {
	if (err) return console.error(err);
	api.listen((err, message) => {
		console.log(message.threadID);
        api.sendMessage('suh dude', message.threadID);
    });
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
});
app	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')
	.get('/', (req, res) => {
		res.render('index', {messages: messages, msgtemplate: msgtemplate})

	})
	// .get('/search', async (req, res) => {
	//   console.log(`Searching for '${req.query.query}'`);
	//   let search = await client.search({
	//     index: 'serviceproviders',
	//     type: 'provider',
	//     body: {
	//       query: {
	//         regexp: {'desc': req.query.query || ''}
	//       }
	//     }
	//   });
	//   res.render('pages/search', {search: search, query: req.query.query});
	// })


function addMessage(msg) {
	messages.push(msg); 
	io.emit('message', msg)
}
setInterval(()=>{
	addMessage({name:"Dom", content: "They did surgery on a grape", avatar: "https://i.imgur.com/JsqkGWc.jpg"});
},2000);
// api.getThreadHistory("100010346405871",5, undefined, (err, hist) => {
// 	messages.push({name:"Dom", content: hist[0].body, avatar: "https://i.imgur.com/JsqkGWc.jpg"});
// });

io.on('connection', client => {
	console.log('Client connected...');
	client.on('join', data => {
		console.log(data);
	});
});
server.listen(port, () => console.log(`Listening on ${port}`));