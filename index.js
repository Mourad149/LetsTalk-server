const express = require("express");
const app = express();

const mongoose = require("mongoose");

const bodyParser = require("body-parser");

const meetingRouter = require("./routes/meeting");
const authRouter = require("./routes/auth");
const meetingController = require("./controllers/meeting");

const isAuth = require("./middlewares/is-auth");

var fs = require("fs");

const cors = require("cors");

var httpsOptions = {
  key: fs.readFileSync("./key2.pem"),
  cert: fs.readFileSync("./cert2.pem"),
  requestCert: false,
  rejectUnauthorized: false,
};
const https = require("https").createServer(httpsOptions, app);

const io = require("socket.io")(https, {
  cors: true,
  origins: ["https://localhost:5000"],
});

let test = "lol";
let connectedUsers = {};
let connectedUsersToMeeting = {};

//  -------------------------------------- Normal shit hh -------------------------------------

//  ---- Parsing the incoming requests
app.use(bodyParser.json());

//  ---- To avoid CORS errors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//  ---- Setting up middlewares
// app.get("/getConnectedUsers", isAuth, (req, res, next) => {
//   res.status(200).json({ connectedUsers: connectedUsers });
// });
app.get("/checkAuth", isAuth, (req, res, next) => {
  res.end();
});
app.use(authRouter);
app.use(meetingRouter);

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
io.of("/onConnect").on("connect", (socket) => {
  socket.on("userIsConnected", (data) => {
    if (data.loggedUser) {
      console.log("id from socket", data.loggedUser);
      connectedUsers[data.loggedUser] = socket.id;
      console.log("connected users", connectedUsers);
    }
  });

  socket.on("getConnectedUsers", () => {
    socket.emit("connectedUsers", { connectedUsers: connectedUsers });
  });
  socket.emit("connectedUsers", { connectedUsers: connectedUsers });
  socket.on("forceDisconnect", (data) => {
    delete connectedUsers[data.userToDisconnect];
    socket.emit("connectedUsers", { connectedUsers: connectedUsers });
  });
});

io.of("/messaging").on("connect", (socket) => {
  socket.on("join", (data) => {
    let room = data.room;
    socket.join(room);
    console.log(room);

    socket.on("sendMessage", (data) => {
      const {
        message,
        senderId,
        meetingId,
        userPdp,
        userRole,
        senderName,
      } = data;
      const object = {
        message: {
          text: message,
          senderCred: {
            image: userPdp,
            userId: senderId,
            userRole: userRole,
            senderName: senderName,
          },
        },
        meetingId: meetingId,
      };
      console.log(message);
      meetingController.addMessage(object);
      io.of("/messaging").to(room).emit("sendToAll", object.message);
    });
    socket.on("handRaised", (data) => {
      const { senderId } = data;
      console.log(data);
      io.of("/messaging").to(room).emit("sendToAll", {
        message: "User has asked for permission to speak",
        senderId,
        raiseHandComponent: true,
        userRole: data.userRole,
      });
    });
  });
  socket.on("joinMeeting", (data) => {
    let room = data.room;
    console.log("joinMeeting", room);
    socket.join(room);
    socket.to(room).emit("user-connected", { userId: data.userId });
  });
  socket.on("getConnectedUsersToMeeting", (data) => {
    connectedUsersToMeeting[data.userId] = data.room;

    socket.emit("connectedUsersToMeeting", {
      connectedUsersToMeeting: connectedUsersToMeeting,
    });
  });

  socket.on("disconnect", () => console.log("user has left"));
});

mongoose
  .connect(
    "mongodb+srv://zakaria:zakaria@cluster0.0al6x.mongodb.net/letsTalk?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((res) =>
    https.listen(5000, () => console.log("port starting at port 5000"))
  )
  .catch((err) => console.log("[ERROR MONGO]", err));
