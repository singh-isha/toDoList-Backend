const express = require('express');
const { signup, signin, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup); 
router.post('/signin', signin);
router.post('/forgotpassword',forgotPassword);
router.put('/resetpassword/:resettoken',resetPassword);


module.exports = router;