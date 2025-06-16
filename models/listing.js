const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');


let defImg = Math.floor(Math.random() * 6); 

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        minLength: 1,
    },
    description: {
        type: String,
        required: true,
        minLength: 1,
    },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
        required: true,
        min: 1,
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
        minLength: 1,
    },
    coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        },
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

});

listingSchema.post('findOneAndDelete', async(listing) => {
    if(listing) {
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

listingSchema.index({ coordinates: '2dsphere' });


const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;