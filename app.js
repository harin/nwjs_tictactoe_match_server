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

var User = function(ip, port, name, socket, isServer) {
    this.ip = ip;
    this.port = port;
    this.name = name;
    this.socket = socket;
    this.isServer = isServer;
    this.gameStarted = undefined;
}
/**************************************************** 
                     Methods
*****************************************************/

server_io.use(function (socket, next) {
  var handshake = socket.handshake;
  console.log("handshake: "+ handshake.query);
  var query = handshake.query
    if (query) {
        var user = new User(query.ip, query.port, query.name, socket, query.isServer);
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

    var newUserLi = '<li id="'+socket.id+'">'+user.name+' | ' + user.ip+ ' | '+ user.port+'  ' ;
    newUserLi += '<button class="btn btn-danger shake" data-id='+socket.id+'>Shake\'em!</button>' +'</li>';
    $("#userlist").append(newUserLi);

    $('.shake').on('click', function(event){

        var id = $(event.target).data('id');

        console.log("shaking " + id);
        var socket = userList[id].socket.emit('quake');
    });

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

    socket.on('userdata', function(data){
        //remove old data
        $('#' + socket.id ).remove();
        //Add new data
        var user = userList[socket.id];


        if(data.name) user.name = data.name;
        if(data.ip) user.ip = data.ip;
        if(data.port) user.port = data.port;
        var newUserLi = '<li id="'+socket.id+'">'+user.name+' | ' + user.ip+ ' | '+ user.port ;
        newUserLi += '<button class="shake" data-id='+socket.id+'>Shake\'em!</button>';
        
        if(data.isServer) {
            user.isServer = data.isServer;
            newUserLi += '<button class="btn btn-danger restartGame" data-id='+socket.id+'>Restart Game</button>'
        }

        newUserLi += '</li>';
        $("#userlist").append(newUserLi);
        $('button.restartGame').on('click', function(event){
            var id = $(event.target).data('id');
            console.log("restarting game for "+id);
            userList[id].socket.emit('restart');
        })
        broadcastUserList();

        $('.shake').on('click', function(event){
            var id = $(event.target).data('id');
            console.log("shaking " + id);
            var socket = userList[id].socket.emit('quake');
        });
    });

    socket.on('gameStarted', function(data){
        userList[socket.id].gameStarted = data;
        broadcastUserList();
    });




});


var broadcastUserList = function() {
    $('#noUser').html(Object.keys(userList).length);

    var list = Object.keys(userList).map(function(id){
        return {
            name: userList[id].name,
            ip: userList[id].ip,
            port: userList[id].port,
            isServer: userList[id].isServer,
            gameStarted: userList[id].gameStarted
        }
    });

    server_io.emit('userList', list);
}


