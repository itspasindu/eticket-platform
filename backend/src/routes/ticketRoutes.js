const express = require('express');
const router = express.Router();
const {
  generateQR,
  validateTicket,
  sendTicketEmail,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get QR code for a booking (ticket owner only)
router.get('/:bookingId/qr', protect, generateQR);

// Send ticket email (ticket owner only)
router.post('/:bookingId/send-email', protect, sendTicketEmail);

// Validate ticket at venue (admin or organizer only)
router.post('/validate', protect, authorize('admin', 'organizer'), validateTicket);

module.exports = router;