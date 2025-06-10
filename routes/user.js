const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl, loginValidator } = require('../middleware');


//Signup Page Routes
router.get('/signup', (req, res) => {
    res.render('users/signup.ejs');
});

router.post('/register', async (req, res, next) => { 
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });

        //Check for duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email is already registered. Please use a different one.');
            return res.redirect('/signup');
        }

        //Register the user and handle errors
        const registeredUser = await User.register(user, password); 
       
        //Log in the newly registered user
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Account created successfully!');
            res.redirect('/listings/allListings');
        });

    } catch (err) {
        if (err.name === "UserExistsError") {
            req.flash('error', 'Username is already taken. Please choose another.');
            return res.redirect('/signup');  //Redirects user back to signup
        }
        next(err);  
    }
});


//Login Page Routes
router.get('/login', async(req, res) => {
    res.render('users/login.ejs');
});

router.post('/login', saveRedirectUrl, 
    loginValidator, 
    passport.authenticate('local', { failureRedirect: '/login' , failureFlash: true }),
    wrapAsync( async(req, res) => {
        req.flash('success', 'You logged in successfully!');
        let redirectUrl = res.locals.redirectUrl || '/listings/allListings';
        res.redirect(redirectUrl);
}));


//Logout Page Routes
router.get('/logout', (req, res, next) => {
    req.logOut((err) => {
        if(err) {
           return next(err);
        }
        req.flash('success', 'You have been logout!');
        res.redirect('/listings/allListings');
    });
});

module.exports = router;