const token = require('./token.json');
const path = require('path');
const login = require('facebook-chat-api');
// login({email: token.email, password: token.password}, (err, api) => {
// 	if (err) return console.error(err);
// 	api.listen((err, message) => {
//         api.sendMessage('suh dude', message.threadID);
//     });
// });

let messages = [
	{name: "Oof", content: "woot", avatar:"https://i.imgur.com/VWcKTrh.jpg"},
	{name: "Oof", content: "boot", avatar:"https://i.imgur.com/VWcKTrh.jpg"},
	{name: "Oof", content: "doot", avatar:"http://www.veggieonapenny.com/wp-content/uploads/2013/11/vegan-cheese-3-1024x731.jpg"}
];

const express = require('express')
const port = 3000
express()
	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')
	.get('/', (req, res) => res.render('index', {messages: messages}))
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
	.listen(port, () => console.log(`Listening on ${port}`));