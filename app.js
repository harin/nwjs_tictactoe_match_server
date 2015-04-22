"use strict";
//match server
var app = require('express')();
var http = require('http').Server(app);
var server_io = require('socket.io')(http);


$(document).ready(function(){
    var randomVal = Math.random()*10;

    if(randomVal < 5){
        firstTurn.first = 'client';
        firstTurn.second = 'server';
    }else{
        firstTurn.first= 'server';
        firstTurn.second= 'client'
    }
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen( 8765 , function(){
    console.log('listening on *:' + 8765);
});

/**************************************************** 
                     Properties
*****************************************************/
var userList = [];
// var lastTurn;
var noConnections = function(){
    return userList.count;
}

var User = function(ip, port, name, socket) {
    this.ip = ip;
    this.port = port;
    this.name = name;
    this.socket = socket;

}
/**************************************************** 
                     Methods
*****************************************************/

server_io.use(function (socket, next) {
  var handshake = socket.handshake;
  console.log("handshake: "+ handshake.query);
  var query = handshake.query
    if (query) {
        var user = new User(query.ip, query.port, query.name, socket);
        userList[socket.id] = user
        next();
    } else {
        console.log("No query found");
    }
});

server_io.on('connection', function(socket){
    console.log('a user connected');

    var user = userList[socket.id];
    console.log("User="+ user);

    var newUserLi = '<li id="'+socket.id+'">'+user.name+' | ' + user.ip+ ' | '+ user.port +'</li>';

    $("#userlist").append(newUserLi);
    broadcastUserList()

    socket.on('disconnect', function(){
        //Update user list
        $('#' + socket.id ).remove();
        delete userList[socket.id]

        //Broadcast user list
        broadcastUserList()
        console.log('user disconnected');
        // server_io.emit('noConnections', --noConnections);
    });

    socket.on('restart', function(data){
        console.log('received restart request');
        // console.log(data.starter+' will get to start');
        restart();
    });
});


var broadcastUserList = function() {
    var list = Object.keys(userList).map(function(id){
        return {
            ip: userList[id].ip,
            port: userList[id].port
        }
    });

    server_io.emit('userList', list);
}
