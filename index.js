const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: true,
  origins: ['http://localhost:3000'],
});

let test = 'lol';

io.of('/messaging').on('connect', (socket) => {
  socket.on('sendMessage', (data) => {
    const { message } = data;
    console.log(message);
    io.of('/messaging').emit('sendToAll', { message });
  });

  socket.on('disconnect', () => console.log('user has left'));
});

http.listen(5000, console.log('port listening on 5000'));
