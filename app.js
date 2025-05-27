const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 8080;
require('dotenv').config(); // Load environment variables
const listingRoutes = require('./routes/listings');
const ejsMate = require('ejs-mate');

//middlewavers
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use('/listings', listingRoutes);
app.engine('ejs', ejsMate);


//connecting to db
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB and using database:", mongoose.connection.name))
  .catch(err => console.error("MongoDB connection error:", err));



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




app.get("/", (req, res)=> {
    console.log("Server working fine");
    res.send("Server working fine");
});


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

