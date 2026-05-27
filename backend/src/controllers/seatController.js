const Seat = require('../models/Seat');
const redis = require('../config/redis');

// ─────────────────────────────────────────
// GET SEATS — GET /api/seats/event/:eventId
// Returns all seats for an event with status
// ─────────────────────────────────────────
const getSeatsByEvent = async (req, res) => {
  try {
    const seats = await Seat.find({ event: req.params.eventId })
      .sort({ row: 1, seatNumber: 1 }); // sort A1,A2,A3...B1,B2...

    // Group seats by row for frontend seat map
    const seatMap = {};
    seats.forEach((seat) => {
      if (!seatMap[seat.row]) {
        seatMap[seat.row] = [];
      }
      seatMap[seat.row].push(seat);
    });

    res.status(200).json({ seats, seatMap });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// LOCK SEATS — POST /api/seats/lock
// User selects seats → lock them for 10 mins
// ─────────────────────────────────────────
const lockSeats = async (req, res) => {
  try {
    const { seatIds, eventId } = req.body;
    const userId = req.user.id;

    // Validate — max 6 seats per booking
    if (seatIds.length > 6) {
      return res.status(400).json({ message: 'Maximum 6 seats per booking' });
    }

    // Find all requested seats
    const seats = await Seat.find({
      _id: { $in: seatIds },
      event: eventId,
    });

    // Check if all seats exist
    if (seats.length !== seatIds.length) {
      return res.status(404).json({ message: 'One or more seats not found' });
    }

    // Check if any seat is already locked or booked
    const unavailable = seats.filter(
      (seat) => seat.status !== 'available'
    );
    if (unavailable.length > 0) {
      return res.status(409).json({
        message: 'Some seats are no longer available',
        unavailableSeats: unavailable.map((s) => s.seatNumber),
      });
    }

    // Lock all seats — 10 minute expiry
    const lockExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now
    const LOCK_DURATION = 600; // 600 seconds = 10 minutes

    // Update seats in database
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        status: 'locked',
        lockedBy: userId,
        lockedUntil: lockExpiry,
      }
    );

    // Set Redis keys for each seat with TTL
    // Key pattern: lock:seat:{seatId}
    // Value: userId (so we know who locked it)
    const redisPromises = seatIds.map((seatId) =>
      redis.setex(
        `lock:seat:${seatId}`, // key
        LOCK_DURATION,          // TTL in seconds
        userId                  // value
      )
    );
    await Promise.all(redisPromises);
    // Promise.all() runs all redis operations at the same time (faster)

    res.status(200).json({
      message: 'Seats locked for 10 minutes',
      lockedUntil: lockExpiry,
      seats: seats.map((s) => ({
        id: s._id,
        seatNumber: s.seatNumber,
        category: s.category,
        price: s.price,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// RELEASE SEATS — POST /api/seats/release
// User cancels → release their locked seats
// ─────────────────────────────────────────
const releaseSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    const userId = req.user.id;

    // Only release seats locked by THIS user
    await Seat.updateMany(
      {
        _id: { $in: seatIds },
        lockedBy: userId,       // safety check
        status: 'locked',
      },
      {
        status: 'available',
        lockedBy: null,
        lockedUntil: null,
      }
    );

    // Delete Redis keys (cancel the timer)
    const redisPromises = seatIds.map((seatId) =>
      redis.del(`lock:seat:${seatId}`)
    );
    await Promise.all(redisPromises);

    res.status(200).json({ message: 'Seats released successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────
// CLEANUP EXPIRED LOCKS — runs automatically
// Called by a scheduled job every 5 minutes
// ─────────────────────────────────────────
const cleanupExpiredLocks = async () => {
  try {
    const now = new Date();

    // Find all seats that are locked but timer has expired
    const expiredSeats = await Seat.find({
      status: 'locked',
      lockedUntil: { $lt: now }, // lockedUntil is less than now
    });

    if (expiredSeats.length > 0) {
      await Seat.updateMany(
        {
          status: 'locked',
          lockedUntil: { $lt: now },
        },
        {
          status: 'available',
          lockedBy: null,
          lockedUntil: null,
        }
      );
      console.log(`Released ${expiredSeats.length} expired seat locks`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

module.exports = {
  getSeatsByEvent,
  lockSeats,
  releaseSeats,
  cleanupExpiredLocks,
};