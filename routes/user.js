const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync.js');
const userController = require('../controllers/user.js');
const { saveRedirectUrl, loginValidator } = require('../middleware');


//Signup Page Routes

//Signup Route
router.get('/signup', userController.renderSignup);

//Registeration Route
router.post('/register', wrapAsync(userController.signup));


//Login Page Routes
router.route('/login')
    .get(userController.renderLogin)
    .post( saveRedirectUrl, 
        loginValidator, 
        passport.authenticate('local', { failureRedirect: '/login' , failureFlash: true }),
        wrapAsync(userController.login));



//Logout Page Routes
router.get('/logout', userController.logout);

module.exports = router;