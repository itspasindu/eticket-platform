const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes — all auth routes start with /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes)
const eventRoutes = require('./src/routes/eventRoutes'); 

app.get('/', (req, res) => {
  res.json({ message: 'E-Ticket API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});