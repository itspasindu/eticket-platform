const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    seatNumber: {
      type: String,  // e.g. "A1", "B12", "C5"
      required: true,
    },
    row: {
      type: String,  // "A", "B", "C"
      required: true,
    },
    category: {
      type: String,
      enum: ['VIP', 'Regular', 'Economy'],
      required: true,
    },
    price: {
      type: Number,
      required: true,  // e.g. 5000 (in LKR)
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
      // available → user selects → locked (10 min) → paid → booked
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,  // which user currently has it locked
    },
    lockedUntil: {
      type: Date,
      default: null,  // lock expiry time
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Seat', seatSchema);