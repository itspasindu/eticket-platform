const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat', // array of seat references
      },
    ],
    totalAmount: {
      type: Number,
      required: true,  // sum of all seat prices
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: String,
      default: '',  // Stripe payment ID (comes after payment)
    },
    ticketCode: {
      type: String,
      unique: true,  // unique QR code identifier
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'used'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);