const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  publishEvent,
  getMyEvents,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ── Public Routes ──────────────────────────────
router.get('/', getEvents);
router.get('/:id', getEventById);

// ── Private Routes (login required) ───────────
router.get('/organizer/my-events', protect, authorize('organizer', 'admin'), getMyEvents);
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.put('/:id/publish', protect, authorize('organizer', 'admin'), publishEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;