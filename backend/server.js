const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const seatRoutes = require("./src/routes/seatRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const ticketRoutes = require("./src/routes/ticketRoutes");

dotenv.config();
connectDB();
require("./src/config/redis");

const app = express();

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    "https://idyllic-starburst-d2ff85.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean),
);

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = origin?.trim();
    const isNetlifyOrigin = normalizedOrigin?.includes("netlify.app");

    if (
      !normalizedOrigin ||
      allowedOrigins.has(normalizedOrigin) ||
      isNetlifyOrigin
    ) {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tickets", ticketRoutes);

const { cleanupExpiredLocks } = require("./src/controllers/seatController");
setInterval(cleanupExpiredLocks, 5 * 60 * 1000);

app.get("/", (req, res) => {
  res.json({ message: "E-Ticket API is running!" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
