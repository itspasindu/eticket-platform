const express = require('express');
const router = express.Router();
const { getSeatsByEvent, lockSeats, releaseSeats } = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/event/:eventId', getSeatsByEvent);           // public
router.post('/lock', protect, lockSeats);                 // must be logged in
router.post('/release', protect, releaseSeats);           // must be logged in

module.exports = router;