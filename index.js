const express = require('express');
const app = express();

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const meetingRouter = require('./routes/meeting');

var fs = require('fs');

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
  origins: [`https://${process.env.BASE_URL}:3000`],
});

let test = 'lol';

//  -------------------------------------- Normal shit hh -------------------------------------

//  ---- Parsing the incoming requests
app.use(bodyParser.json());

//  ---- To avoid CORS errors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//  ---- Setting up middlewares
app.use('/', meetingRouter);

//  Error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.statusCode || 500,
      message: err.message,
    },
  });
});

// ---------------------------------------- Sockets shit hh -------------------------------
io.of('/messaging').on('connect', (socket) => {
  socket.on('join', (data) => {
    let room = data.room;
    socket.join(room);
    console.log(room);
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
  socket.on('joinMeeting', (data) => {
    let room = data.room;
    socket.join(room);
    console.log(room);
    socket.to(room).emit('user-connected', { userId: data.userId });
  });
  socket.on('disconnect', () => console.log('user has left'));
});

mongoose
  .connect(
    'mongodb+srv://zakaria:zakaria@cluster0.0al6x.mongodb.net/letsTalk?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((res) => http.listen(5000, console.log('port listening on 5000')))
  .catch((err) => console.log('[ERROR MONGO]', err));
