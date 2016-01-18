( function () {

  //Room model
  function Room (name, socket, inbox) {
    this.inbox = inbox;
    this.name = name;
    this.socket = socket;
    socket.emit('join', name);
    socket.on('message', this.add.bind(this));
  }
  function leave () {
    this.socket.emit('leave', this.name);
  }
  function getInbox () {
    return this.inbox;
  }
  function add (data) {
    this.inbox.unshift(data.message);
  }
  function send (message) {
    this.socket.emit('send', {room: this.name, message: message});
    message.nickname = message.nickname + ' (You)';
    this.add({message: message});
  }

  Room.prototype.add = add;
  Room.prototype.send = send;
  Room.prototype.leave = leave;
  Room.prototype.getInbox = getInbox;

  //angular app
  var chat = window.angular.module('chatApp', []);
  chat.service('Socket', [ function() { return window.io(); }]);  
  chat.controller('MessageManager', ['$scope', '$http', 'Socket', '$interval', MessageManager]);

  function MessageManager ($scope, $http, Socket, $interval) {
    var DEFAULT_ROOM = 'default';
    var GIPHY_CMD = '/giphy ';
    var nickname = localStorage.getItem('nickname');
    $scope.send = sendMessage;
    $scope.save = save;
    $scope.inbox = [];
    $scope.hasNickname = !!nickname;

    var  room = new Room(DEFAULT_ROOM, Socket, $scope.inbox);
    if (!!nickname) { $scope.nickname = nickname; }

    function sendMessage () {
      searchGiphy({nickname: nickname, text: $scope.text, ts: new Date().getTime()});
      $scope.text = '';
    }

    function save () { 
      localStorage.setItem('nickname', $scope.nickname);
      window.location.reload();
    }

    $interval(function () { 
      var roomInbox =  room.getInbox();
      if (roomImbox.length!==$scope.inbox.length) {
        $scope.inbox = room.getInbox();
      }
    }, 100);

    function searchGiphy (message) {
      if (message.text.startsWith(GIPHY_CMD)) {
        var search = message.text.replace(GIPHY_CMD,'');
        message.original = message.text;
        message.text = search;
        $http.get('http://api.giphy.com/v1/gifs/search?q=' + search.split(' ').join('+') + '&api_key=dc6zaTOxFJmzC&limit=1&offset=0')
        .success( function (res) {
          var first = res.data[0];
          if (first) {
            message.image = first.images.original.url;
          }
          room.send(message);
        });
      } else {
        room.send(message);
      }
    }

  }

})( );
