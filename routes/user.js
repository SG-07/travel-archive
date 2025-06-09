const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/expressError.js');
const loginSchema = require('../schemas/loginSchema');
const passport = require('passport');


//loginValidator function
const loginValidator = (req, res, next) => {
    let { error } = loginSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}; 

//Signup Page Routes
router.get('/signup', (req, res) => {
    res.render('users/signup.ejs');
});

router.post('/register', async (req, res, next) => { 
    const { username, email, password } = req.body;
    const user = new User({ username, email });

    //check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log('Email is already registered. Please use a different one')
        req.flash('error', 'Email is already registered. Please use a different one.');
        return res.redirect('/signup');
    }
    
    //if email is unique check for username and save if it's unique
    User.register(user, password, (err, newUser) => {
        if (err) {
            if (err.name === "UserExistsError") { 
                console.log('Username is already taken. Please choose another')
                req.flash('error', 'Username is already taken. Please choose another.');
                return res.redirect('/signup'); 
            }
            return next(err); // Forward other errors to Express error handler
        }

        req.flash('success', 'Account created successfully!');
        res.redirect('/listings/allListings');
    });
});

//Login Page Routes
router.get('/login', async(req, res) => {
    res.render('users/login.ejs');
});

router.post('/login', 
    loginValidator, 
    passport.authenticate('local', { failureRedirect: '/login' , failureFlash: true }),
    wrapAsync( async(req, res) => {
        req.flash('success', 'You logged in successfully!');
        res.redirect('/listings/allListings');
}));


module.exports = router;