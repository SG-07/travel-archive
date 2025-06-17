const mongoose = require('mongoose');
const Review = require('../models/review');
const Listing = require('../models/listing');
const User = require('../models/user');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ----------- VARIED REVIEW COMMENTS -----------
const comments = [
  // Positive
  "Incredible experience, saw so much wildlife!",
  "The view was amazing, and the staff were lovely.",
  "Would definitely visit again!",
  "Clean, comfortable, and the food was excellent.",
  "We even spotted a leopard right from our tent!",
  "Perfect location and great vibes.",
  "Loved the bonfire nights under the stars.",
  "Such a peaceful and unforgettable getaway.",
  "Great for photography lovers!",
  "Could not recommend this place more!",
  "Hosts were super friendly and welcoming.",
  "Everything exceeded expectations — from location to hospitality.",
  "One of the best stays I've ever had!",
  "The decor and ambiance were absolutely stunning.",

  // Neutral
  "Overall decent experience, though nothing extraordinary.",
  "Good location, but the room was smaller than expected.",
  "Food was okay, but could have been hotter.",
  "The place matched the description, no surprises.",
  "Stay was fine, but not sure I’d come back.",
  "Decent value for the money.",
  "The staff were nice, but service was a bit slow.",
  "Average experience — not bad, not great.",
  "Some good moments, but the noise was annoying.",

  // Negative
  "Not worth the price. Found better places nearby.",
  "Room was dirty when we arrived.",
  "Too noisy at night — couldn't sleep well.",
  "Pictures were misleading, expected better.",
  "Poor communication from the host.",
  "Facilities were outdated and not maintained properly.",
  "Had to wait 30 minutes to check in.",
  "Wouldn’t recommend for a family stay."
];

// ------------- HELPERS ---------------
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getRatingForComment(comment) {
  if (
    comment.includes("not") ||
    comment.includes("dirty") ||
    comment.includes("poor") ||
    comment.includes("wait") ||
    comment.includes("noisy") ||
    comment.includes("misleading")
  ) {
    return Math.floor(Math.random() * 2) + 1; // 1 or 2 stars
  } else if (
    comment.includes("okay") ||
    comment.includes("average") ||
    comment.includes("decent")
  ) {
    return 3;
  } else {
    return Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
  }
}

async function seedFakeReviews() {
  try {
    const users = await User.find({});
    if (!users.length) {
      console.error("❌ No users found in DB. Cannot assign authors.");
      return;
    }

    const listings = await Listing.find({});
    if (!listings.length) {
      console.error("❌ No listings found.");
      return;
    }

    for (let listing of listings) {
      const reviewCount = Math.floor(Math.random() * 4) + 2; // 2 to 5 reviews
      const reviewIds = [];

      for (let i = 0; i < reviewCount; i++) {
        const randomUser = getRandomElement(users);
        const comment = getRandomElement(comments);
        const rating = getRatingForComment(comment);

        const review = new Review({
          comment,
          rating,
          author: randomUser._id,
        });

        await review.save();
        reviewIds.push(review._id);
      }

      listing.reviews.push(...reviewIds);
      await listing.save();

      console.log(`✅ ${reviewCount} reviews added to: ${listing.title}`);
    }

    console.log("\n🎉 Done seeding fake reviews!");
  } catch (err) {
    console.error("❌ Error seeding reviews:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedFakeReviews();
