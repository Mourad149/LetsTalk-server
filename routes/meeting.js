const express = require('express');
const meetingController = require('../controllers/meeting');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/getMessages/:meetingId', isAuth, meetingController.getMessages);
router.get('/meetings/:skip', isAuth, meetingController.getAllMeetings);
router.post('/meetings', isAuth, meetingController.createMeeting);

module.exports = router;
