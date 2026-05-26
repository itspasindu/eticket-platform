const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['concert', 'sports', 'theater', 'comedy', 'other'],
      required: true,
    },
    venue: {
      name: { type: String, required: true },    // "Nelum Pokuna Theater"
      address: { type: String, required: true },  // "Colombo 07"
      city: { type: String, required: true },     // "Colombo"
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,  // "7:00 PM"
      required: true,
    },
    image: {
      type: String,  // Cloudinary URL
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId, // links to a User document
      ref: 'User',                          // tells mongoose which collection
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false, // organizer must publish manually
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);