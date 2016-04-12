//invokes dependencies
var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.render('index');
})
//declares variables outside the server for scoping
var users = {};
var all_users = [];
var all_messages = [];
var number_of_messages = 0;
//set up server
var server = app.listen(8000, function(){
	console.log('listening on 8k');
})
var io = require('socket.io').listen(server);
//when sockets are engaged:
io.sockets.on('connection', function(socket){
	console.log('sockets engaged!');
	console.log(socket.id);
	//when new user joins:
	socket.on('user_join', function(data){
		console.log(data.name);
		//save user name and socket id
		users = {
			sockid : socket.id,
			name: data.name
		}
		console.log(users)
		all_users.push(users);
		console.log("all_users",all_users)
		//let new user know they are in, send all messages already in chatroom
		socket.emit('to_joined_user', {message: "thank you for joining the room.", users: users, allmessages: all_messages, allusers: all_users});
		socket.broadcast.emit('to_other_users', {joiner: users.name})
	})
	//when user posts a new message
	socket.on('sending_message', function(data){
		console.log(data.message);
		number_of_messages++;
		//save this comment to a variable to send to all users, so it shows up in chat
		var each_comment = {
			user: users.sockid,
			name: data.message.name,
			message: data.message.mtext,
			messageid: number_of_messages,
		}
		//add this comment to the array of all messages
		all_messages.push(each_comment);
		// console.log(all_messages);
		//send this message to everyone
		io.emit('update_messages', {message: each_comment});
	})
	//when user disconnects, alert all other users.
	socket.on('disconnect', function(){
		var del = all_users.indexOf(users.name)
		console.log("all users =", all_users)
		all_users.slice(del, 1);
		io.emit('disconnect_msg', {disco_message: users.name})
	})
})
