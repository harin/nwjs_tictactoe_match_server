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

/**************************************************** 
                     Properties
*****************************************************/


var userList = {};
// var lastTurn;
var noConnections = function(){
    return userList.count;
}

class user {
    var ip;
    var port;
    var name;
}

var serverScore = 0;
var clientScore = 0;
var winner = "";

/**************************************************** 
                     Methods
*****************************************************/


server_io.on('connection', function(socket){
    console.log('a user connected');
    //Update user list

    //Broadcast user list
    server_io.emit('serverName', serverName);


    socket.on('disconnect', function(){
        //Update user list

        //Broadcast user list
        console.log('user disconnected');
        server_io.emit('noConnections', --noConnections);
    });

    socket.on('restart', function(data){
        console.log('received restart request');
        // console.log(data.starter+' will get to start');
        restart();
    });

    socket.on('resetBoard', function(data){
        resetBoard();
    });

    // socket.on('restart', function(){
    //     restart();
    // });

});

