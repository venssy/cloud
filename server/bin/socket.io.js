var server = require('./server')
var io = require('socket.io')(server)

io.on('connection', function (socket) {
  console.log('io connection');
});

module.exports = server;