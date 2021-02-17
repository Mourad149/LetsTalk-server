const Meeting = require("../models/meeting");
var ObjectID = require("mongodb").ObjectID;

exports.getAllMeetings = (req, res, next) => {
  Meeting.find()
    .sort({ _id: -1 })
    .skip(parseInt(req.params.skip))
    .limit(10)
    .then((meetings) => {
      if (meetings) {
        return res.status(200).json({
          message: "SUCCESS",
          meetings: meetings,
        });
      }
      const error = new Error("Could not find meetings.");
      error.statusCode = 404;

      throw error;
    })
    .catch((err) => {
      next(err);
    });
};
exports.addMessage = (object) => {
  const { meetingId, message } = object;

  Meeting.updateOne(
    { _id: ObjectID(meetingId) },
    { $push: { messages: message } }
  )
    .then((res) => console.log("updated with success", res))
    .catch((err) => console.log(err));
};
exports.getMessages = (req, res, next) => {
  Meeting.find({ _id: ObjectID(req.params.meetingId) }, "messages")
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.createMeeting = (req, res, next) => {
  const theme = req.body.theme;
  const description = req.body.description;
  const hostId = req.body.hostId;
  const participants = req.body.participants;
  const startTime = req.body.startTime;
  const startDate = req.body.startDate;
  const messages = [];

  const meeting = new Meeting({
    theme: theme,
    description: description,
    hostId: hostId,
    participants: participants,
    startTime: startTime,
    startDate: startDate,
    messages: messages,
  });
  meeting
    .save()
    .then((meeting) => {
      res.status(201).json({
        message: "SUCCESS",
        data: meeting,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
