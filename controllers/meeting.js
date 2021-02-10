const Meeting = require('../models/meeting');

exports.getAllMeetings = (req, res, next) => {
  console.log(req.params.skip);
  Meeting.find()
    .sort({ _id: -1 })
    .skip(parseInt(req.params.skip))
    .limit(5)
    .then((meetings) => {
      console.log(meetings);
      if (meetings) {
        return res.status(200).json({
          message: 'SUCCESS',
          meetings: meetings,
        });
      }
      const error = new Error('Could not find meetings.');
      error.statusCode = 404;

      throw error;
    })
    .catch((err) => {
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

  const meeting = new Meeting({
    theme: theme,
    description: description,
    hostId: hostId,
    participants: participants,
    startTime: startTime,
    startDate: startDate,
  });
  meeting
    .save()
    .then((meeting) => {
      res.status(201).json({
        message: 'SUCCESS',
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
