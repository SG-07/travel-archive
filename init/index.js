require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');


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


const initDB = async () => {
    mongoose.connection.once('open', async () => {
        console.log("Connected to MongoDB, now adding listings...");
        await Listing.deleteMany({});
        initData.data = initData.data.map((obj) => ({...obj, owner: '6845869a01a30aeab568fdbf' }));
        await Listing.insertMany(initData.data);
        console.log("Listings addd successfully.");
    });
};

initDB();
