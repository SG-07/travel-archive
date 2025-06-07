const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
require('dotenv').config(); // Load environment variables
const listingRoutes = require('./routes/listings');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/expressError.js');
const reviewsRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
//seesion params
const sessionOptions = { 
    secret: 'kEyisnotToBEESSharEd', 
    resave: false, 
    saveUninitialized: true, 
    cookie: { 
        expiry: Date.now() + 7*24*60*60*1000, 
        maxAge: 7*24*60*60*1000, 
        httpOnly: true, 
    }, 
};


// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(session(sessionOptions));
app.use(flash());


// Root redirect
app.get("/", (req, res)=> {
    console.log("Server working fine");
    res.redirect('/listings/allListings');
});


//flash message
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


// Routes
app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewsRoutes); 

//connecting to db
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // ✅ Allows MongoDB 30 sec to respond before timing out
    socketTimeoutMS: 45000, // ✅ Ensures longer wait time before closing connection
})
  .then(() => {
      console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
  })
  .catch(err => {
      console.error("MongoDB connection error:", err);
      process.exit(1); // ✅ Exits process on critical failure
  });

//disconneting from db
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
    } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
    }
});



app.use((err, req, res, next) => {
    console.error("Error Details:", err); 
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render('error.ejs', { message, statusCode }); 
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});