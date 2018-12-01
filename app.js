const token = require("./token.json")
const login = require("facebook-chat-api");
login({email: token.email, password: token.password}, (err, api) => {
	if (err) return console.error(err);
	api.listen((err, message) => {
        api.sendMessage("suh dude", message.threadID);
    });
});

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))