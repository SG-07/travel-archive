import { inject } from "@vercel/analytics";
inject(); // ✅ Injects Vercel Analytics script into your app

const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config(); // Load environment variables

const listingRoutes = require("./routes/listings");
const reviewsRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const app = express();
const port = process.env.PORT || 8080;

// Session params
const sessionOptions = {
    secret: "kEyisnotToBEESSharEd",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Root redirect
app.get("/", (req, res) => {
    console.log("Server working fine");
    res.redirect("/listings/allListings");
});

// Flash message
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);

// Connecting to database
mongoose
    .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // ✅ Exits process on critical failure
    });

// Disconnecting from database on exit
process.on("SIGINT", async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
    } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error Details:", err);
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message, statusCode });
});

// Export the Express app so Vercel can recognize it
module.exports = app;
