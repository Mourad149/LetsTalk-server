const express = require('express');
const authController = require('../controllers/auth');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/getRegistredUsers',isAuth,authController.getRegistredUsers)

module.exports = router;
