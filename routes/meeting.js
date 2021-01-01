const express = require('express');
const meetingController = require('../controllers/meeting');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/meetings/:skip', meetingController.getAllMeetings);
router.post('/meetings', meetingController.createMeeting);

module.exports = router;
