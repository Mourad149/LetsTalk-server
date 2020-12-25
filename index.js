const express = require('express');
var fs = require('fs');
const app = express();
const cors = require('cors');
var httpsOptions = {
  key: fs.readFileSync('./key2.pem'),
  cert: fs.readFileSync('./cert2.pem'),
  requestCert: false,
  rejectUnauthorized: false,
};
const http = require('https').createServer(httpsOptions, app);

const io = require('socket.io')(http, {
  cors: true,
  origins: ['https://192.168.1.5:3000'],
});

let test = 'lol';

io.of('/messaging').on('connect', (socket) => {
  socket.on('join', (data) => {
    let room = data.room;
    socket.join(room);
    console.log(room);
    io.of('/messaging')
      .to(room)
      .emit('user-connected', { userId: data.userId });
    socket.on('sendMessage', (data) => {
      const { message, senderId } = data;
      console.log(message);
      io.of('/messaging').to(room).emit('sendToAll', { message, senderId });
    });
    socket.on('handRaised', (data) => {
      const { senderId } = data;
      console.log(data);
      io.of('/messaging').to(room).emit('sendToAll', {
        message: 'User has asked for permission to speak',
        senderId,
        raiseHandComponent: true,
        userRole: data.userRole,
      });
    });
  });

  socket.on('disconnect', () => console.log('user has left'));
});

http.listen(5000, console.log('port listening on 5000'));
