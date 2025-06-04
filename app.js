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
const listingSchema = require('./schemas/listingSchema.js')

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(express.json());


// Routes
app.use('/listings', listingRoutes);

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

// Root redirect
app.get("/", (req, res)=> {
    console.log("Server working fine");
    res.redirect('/listings/allListings');
});

app.use((err, req, res, next) => {
    console.error("Error Details:", err); // ✅ Debugging log
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render('error.ejs', { message, statusCode }); // ✅ Ensure correct variable names
});



app.use((err, req, res, next) => {
    let {statusCode= 500, message= 'something went Wrong!'} = err;
    res.status(statusCode).render('error.ejs', { message, statusCode });
    
});


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

