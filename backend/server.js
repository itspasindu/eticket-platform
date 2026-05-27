const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

const authRoutes    = require('./src/routes/authRoutes');
const eventRoutes   = require('./src/routes/eventRoutes');
const seatRoutes    = require('./src/routes/seatRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const ticketRoutes  = require('./src/routes/ticketRoutes');

dotenv.config();
connectDB();
require('./src/config/redis');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/seats',    seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets',  ticketRoutes);

const { cleanupExpiredLocks } = require('./src/controllers/seatController');
setInterval(cleanupExpiredLocks, 5 * 60 * 1000);

app.get('/', (req, res) => {
  res.json({ message: 'E-Ticket API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});