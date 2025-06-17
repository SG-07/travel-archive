const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/user');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

async function seedUsers() {
  try {
    const usersData = [
      { username: 'Aryan', email: 'aryan@example.com' },
      { username: 'bobby', email: 'bobby@example.com' },
      { username: 'Shiv', email: 'shiv@example.com' },
      { username: 'Shrikant', email: 'shrikant@example.com' },
      { username: 'Rahul', email: 'rahul@example.com' }
    ];

    for (let userData of usersData) {
      const user = new User({ email: userData.email, username: userData.username });
      await User.register(user, process.env.password); // Using passport-local-mongoose method
    }

    console.log("🎉 Fake users created!");
  } catch (err) {
    console.error("❌ Error creating users:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedUsers();
