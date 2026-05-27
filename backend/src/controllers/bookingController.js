const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Event = require('../models/Event');
const redis = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────
// CREATE BOOKING — POST /api/bookings
// Called after seats are locked, before payment
// ─────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const { eventId, seatIds } = req.body;
    const userId = req.user.id;

    // 1. Verify all seats are locked BY this user
    const seats = await Seat.find({
      _id: { $in: seatIds },
      event: eventId,
      status: 'locked',
      lockedBy: userId, // must be locked by THIS user
    });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({
        message: 'Seats are not locked by you or lock has expired. Please select seats again.',
      });
    }

    // 2. Calculate total amount
    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

    // 3. Generate unique ticket code
    const ticketCode = uuidv4(); // e.g. "550e8400-e29b-41d4-a716-446655440000"

    // 4. Create booking with pending payment status
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      seats: seatIds,
      totalAmount,
      ticketCode,
      paymentStatus: 'pending',
      status: 'active',
    });

    res.status(201).json({
      message: 'Booking created. Proceed to payment.',
      booking: {
        id: booking._id,
        ticketCode: booking.ticketCode,
        totalAmount: booking.totalAmount,
        seats: seats.map((s) => ({
          seatNumber: s.seatNumber,
          category: s.category,
          price: s.price,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// CONFIRM BOOKING — PUT /api/bookings/:id/confirm
// Called after successful payment
// ─────────────────────────────────────────
const confirmBooking = async (req, res) => {
  try {
    const { paymentId } = req.body; // from Stripe (Phase 6)
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify this booking belongs to the logged in user
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 1. Update booking to paid
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentId;
    await booking.save();

    // 2. Mark all seats as permanently booked
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        status: 'booked',
        lockedBy: null,
        lockedUntil: null,
      }
    );

    // 3. Update event available seats count
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { availableSeats: -booking.seats.length },
      // $inc decrements availableSeats by number of booked seats
    });

    // 4. Clean up Redis locks (seats are now permanently booked)
    const redisPromises = booking.seats.map((seatId) =>
      redis.del(`lock:seat:${seatId}`)
    );
    await Promise.all(redisPromises);

    res.status(200).json({
      message: 'Booking confirmed! Enjoy the event!',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// GET MY BOOKINGS — GET /api/bookings/my
// User sees their booking history
// ─────────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event', 'title date venue image') // get event details
      .populate('seats', 'seatNumber row category price') // get seat details
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// GET SINGLE BOOKING — GET /api/bookings/:id
// Used to show ticket / QR code
// ─────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date time venue image')
      .populate('seats', 'seatNumber row category price')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the ticket owner or admin can view
    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// CANCEL BOOKING — PUT /api/bookings/:id/cancel
// ─────────────────────────────────────────
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Release seats back to available
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      { status: 'available', lockedBy: null, lockedUntil: null }
    );

    // Update event available seats count
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { availableSeats: booking.seats.length },
    });

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  confirmBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};