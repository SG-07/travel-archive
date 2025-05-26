const mongoose = require('mongoose');
const { type } = require('os');
const Schema = mongoose.Schema;

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
    type: String,
    default:
      "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    set: (v) =>
      v === ""
        ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
        : v,
  },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1527555197883-98e27ca0c1ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
        set: (v) => 
            v === '' 
              ? 'https://images.unsplash.com/photo-1527555197883-98e27ca0c1ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80'
              : v,
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

});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;