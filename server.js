var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.render('index');
})

var users = {};
var all_messages = [];
var number_of_messages = 0;
var server = app.listen(8000, function(){
	console.log('listening on 8k');
})
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
	console.log('sockets engaged!');
	console.log(socket.id);
	socket.on('user_join', function(data){
		console.log(data.name);
		users = {
			sockid : socket.id,
			name: data.name
		}
		console.log(users)
		socket.emit('to_joined_user', {message: "thank you for joining the room.", users: users, allmessages: all_messages });
		socket.broadcast.emit('to_other_users', {joiner: users.name})
	})
	socket.on('sending_message', function(data){
		console.log(data.message);
		number_of_messages++;
		var each_comment = {
			user: users.sockid,
			name: data.message.name,
			message: data.message.mtext,
			messageid: number_of_messages,
		}
		all_messages.push(each_comment);
		console.log(all_messages);
		io.emit('update_messages', {message: each_comment});
		socket.emit('allmessages', {allmessages: all_messages});
	})
	socket.on('disconnect', function(){
		io.emit('disconnect', {disco_message:'user '+users.name+' disconnected'})
	})
})
