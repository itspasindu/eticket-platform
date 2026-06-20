const QRCode = require("qrcode");
const Booking = require("../models/Booking");
const transporter = require("../config/email");

// GENERATE QR CODE — GET /api/tickets/:bookingId/qr
// Returns QR code as base64 image

const generateQR = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("event", "title date time venue")
      .populate("seats", "seatNumber row category");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only ticket owner can get their QR
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only paid bookings get a QR code
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // The QR encodes a JSON string with key ticket info
    // When scanned, this data is revealed
    const qrData = JSON.stringify({
      ticketCode: booking.ticketCode,
      bookingId: booking._id,
      event: booking.event.title,
      date: booking.event.date,
    });

    // Generate QR as base64 string (can be displayed directly in <img> tag)
    // format: "data:image/png;base64,iVBOR..."
    const qrCodeBase64 = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    res.status(200).json({
      qrCode: qrCodeBase64,
      ticketCode: booking.ticketCode,
      booking: {
        id: booking._id,
        event: booking.event,
        seats: booking.seats,
        totalAmount: booking.totalAmount,
        status: booking.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// VALIDATE TICKET — POST /api/tickets/validate
// Used by staff at the venue to scan QR
// Only admin or organizer can validate

const validateTicket = async (req, res) => {
  try {
    const { ticketCode } = req.body;

    // Find booking by ticket code
    const booking = await Booking.findOne({ ticketCode })
      .populate("event", "title date time venue")
      .populate("user", "name email")
      .populate("seats", "seatNumber row category");

    // Ticket not found
    if (!booking) {
      return res.status(404).json({
        valid: false,
        message: "Invalid ticket — not found in system",
      });
    }

    // Ticket already used
    if (booking.status === "used") {
      return res.status(400).json({
        valid: false,
        message: "Ticket already used",
        usedAt: booking.updatedAt,
      });
    }

    // Ticket cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        valid: false,
        message: "Ticket has been cancelled",
      });
    }

    // Payment not completed
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        valid: false,
        message: "Payment not completed for this ticket",
      });
    }

    // ✅ Valid ticket — mark as USED
    booking.status = "used";
    await booking.save();

    res.status(200).json({
      valid: true,
      message: "✅ Valid Ticket — Entry Granted!",
      ticket: {
        holderName: booking.user.name,
        holderEmail: booking.user.email,
        event: booking.event.title,
        date: booking.event.date,
        time: booking.event.time,
        venue: booking.event.venue.name,
        seats: booking.seats.map((s) => s.seatNumber),
        ticketCode: booking.ticketCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// SEND TICKET EMAIL — POST /api/tickets/:bookingId/send-email
// Sends QR code to user's email

const sendTicketEmail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("event", "title date time venue image")
      .populate("seats", "seatNumber row category price")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Generate QR code for email
    const qrData = JSON.stringify({
      ticketCode: booking.ticketCode,
      bookingId: booking._id,
    });
    const qrCodeBase64 = await QRCode.toDataURL(qrData, { width: 250 });

    // Extract base64 data (remove the "data:image/png;base64," prefix)
    const qrImageData = qrCodeBase64.split(",")[1];

    // Build seat list for email
    const seatList = booking.seats
      .map((s) => `${s.seatNumber} (${s.category}) - LKR ${s.price}`)
      .join("<br/>");

    // HTML email template
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: #6366f1; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🎟️ Your Ticket is Confirmed!</h1>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
          
          <h2 style="color: #1e293b;">Hi ${booking.user.name}!</h2>
          <p style="color: #64748b;">Your booking is confirmed. Show the QR code below at the venue entrance.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #6366f1; margin-top: 0;">📅 Event Details</h3>
            <p><strong>Event:</strong> ${booking.event.title}</p>
            <p><strong>Date:</strong> ${new Date(booking.event.date).toDateString()}</p>
            <p><strong>Time:</strong> ${booking.event.time}</p>
            <p><strong>Venue:</strong> ${booking.event.venue.name}, ${booking.event.venue.city}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #6366f1; margin-top: 0;">🪑 Your Seats</h3>
            <p>${seatList}</p>
            <hr style="border: 1px solid #e2e8f0;"/>
            <p><strong>Total Paid: LKR ${booking.totalAmount}</strong></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #1e293b;">Your QR Code</h3>
            <p style="color: #64748b; font-size: 12px;">Ticket Code: ${booking.ticketCode}</p>
            <!-- QR code embedded as inline image -->
            <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px;"/>
            <p style="color: #ef4444; font-size: 12px;">⚠️ Do not share this QR code with others</p>
          </div>

          <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
            <p>© 2026 E-Ticket Platform · Built with Pasindu and Sindupa</p>
          </div>

        </div>
      </div>
    `;

    // Send email with QR code embedded as attachment
    await transporter.sendMail({
      from: `"E-Ticket Platform" <${process.env.EMAIL_USER}>`,
      to: booking.user.email,
      subject: `🎟️ Your Ticket — ${booking.event.title}`,
      html: emailHTML,
      attachments: [
        {
          filename: "ticket-qr.png",
          content: qrImageData,
          encoding: "base64",
          cid: "qrcode", // matches src="cid:qrcode" in HTML
        },
      ],
    });

    res.status(200).json({
      message: `Ticket email sent to ${booking.user.email}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { generateQR, validateTicket, sendTicketEmail };
