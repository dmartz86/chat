(function () {
  "use strict";

  var path    = require('path');
  var express = require('express');
  var app     = express();
  var server  = require('http').createServer(app);
  var io      = require('socket.io')(server);

  app.use(express.static(path.join(__dirname, '/public')));
  app.set('port', 1344);

  server.listen(app.get('port'), function () {
    console.log('Chat server ready on port', app.get('port'));
  });

  io.on('connection', function (socket) {

    socket.on('join', function (roomName) {
      console.log('joining on: ' + roomName);
      socket.join(roomName);
    });

    socket.on('leave', function (roomName) {
      socket.leave(roomName);
    });

    socket.on('send', function (data) {
      console.log(data);
      socket.to(data.room).emit('message', {
        message: data.message,
        timestamp: new Date().getTime()
      });
    });
  });

})();
