"use strict";

var app = require('express')();
var http = require('http').Server(app);
var server_io = require('socket.io')(http);
var firstTurn = {};

$(document).ready(function(){
    var randomVal = Math.random()*10;

    if(randomVal < 5){
        firstTurn.first = 'client';
        firstTurn.second = 'server';
    }
    else{
        firstTurn.first= 'server';
        firstTurn.second= 'client'
    }
    console.log("first round= "+firstTurn);
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
  console.log(handshake.query);
  var query = handshakeData.query
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
    console.log("User="+ userList[socket.id]);
    var newUserLi = '<li>test</li>'

    $("#userlist").append(newUserLi);

    // server_io.emit('requestUserInfo');

    // socket.on('userData', function(data){
    //     var newUser = user();
    //     newUser.ip = data.ip;
    //     newUser.port = data.port;
    //     newUser.name = data.name;
    // });
    server_io.emit('userList', userList);

    //Update user list
    //Broadcast user list

    socket.on('disconnect', function(){
        //Update user list
        $('#userList #someid').remove();
        delete userList[socket.id]

        //Broadcast user list
        server_io.emit('userList', userList);
        console.log('user disconnected');
        // server_io.emit('noConnections', --noConnections);
    });

    socket.on('restart', function(data){
        console.log('received restart request');
        // console.log(data.starter+' will get to start');
        restart();
    });


});

