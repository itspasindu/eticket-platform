const Event = require('../models/Event');
const Seat = require('../models/Seat');

// CREATE EVENT — POST /api/events
// Only organizers can do this

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      venue,
      date,
      time,
      image,
      ticketCategories, // array of seat categories with prices
    } = req.body;

    // Calculate total seats from all categories
    // e.g. [{category:'VIP', rows:['A','B'], seatsPerRow:10, price:5000}, ...]
    let totalSeats = 0;
    ticketCategories.forEach((cat) => {
      totalSeats += cat.rows.length * cat.seatsPerRow;
    });

    // Create the event — organizer is the logged in user
    const event = await Event.create({
      title,
      description,
      category,
      venue,
      date,
      time,
      image,
      organizer: req.user.id, // comes from protect middleware
      totalSeats,
      availableSeats: totalSeats,
    });

    // Auto-generate seats for this event
    // e.g. VIP rows A,B with 10 seats = A1,A2...A10, B1,B2...B10
    const seatsToCreate = [];

    ticketCategories.forEach((cat) => {
      cat.rows.forEach((row) => {
        for (let i = 1; i <= cat.seatsPerRow; i++) {
          seatsToCreate.push({
            event: event._id,
            seatNumber: `${row}${i}`, // e.g. "A1", "B5"
            row: row,
            category: cat.category,
            price: cat.price,
            status: "available",
          });
        }
      });
    });

    // insertMany() is faster than creating one by one
    await Seat.insertMany(seatsToCreate);

    res.status(201).json({
      message: "Event created successfully",
      event,
      seatsCreated: seatsToCreate.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ALL EVENTS — GET /api/events
// Public — anyone can browse

const getEvents = async (req, res) => {
  try {
    // req.query contains URL query params
    // e.g. /api/events?category=concert&city=Colombo&page=1
    const { category, city, search, page = 1, limit = 10 } = req.query;

    // Build filter object dynamically
    const filter = { isPublished: true }; // only show published events

    if (category) filter.category = category;
    if (city) filter["venue.city"] = city;
    if (search) {
      // Search in title or description (case insensitive)
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination — don't load ALL events at once
    const skip = (page - 1) * limit; // page 2 = skip first 10

    const events = await Event.find(filter)
      .populate("organizer", "name email") // replace organizer ID with actual name+email
      .sort({ date: 1 }) // sort by date ascending
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      events,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET SINGLE EVENT — GET /api/events/:id
// Public

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email",
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get seat summary for this event
    const seatSummary = await Seat.aggregate([
      { $match: { event: event._id } },
      {
        $group: {
          _id: { category: "$category", status: "$status" },
          count: { $sum: 1 },
          price: { $first: "$price" },
        },
      },
    ]);

    res.status(200).json({ event, seatSummary });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE EVENT — PUT /api/events/:id
// Only the organizer who created it

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check ownership — only creator can edit
    // event.organizer is ObjectId, req.user.id is string → convert to compare
    if (event.organizer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
      // new: true      → return updated doc (not old one)
      // runValidators  → apply schema rules on update too
    );

    res.status(200).json({ message: "Event updated", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE EVENT — DELETE /api/events/:id
// Only the organizer who created it

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check ownership
    if (event.organizer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Also delete all seats belonging to this event
    await Seat.deleteMany({ event: req.params.id });

    res.status(200).json({ message: "Event and seats deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUBLISH EVENT — PUT /api/events/:id/publish
// Makes event visible to public

const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    event.isPublished = true;
    await event.save();

    res.status(200).json({ message: "Event published!", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET MY EVENTS — GET /api/events/my-events
// Organizer sees only their own events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  publishEvent,
  getMyEvents,
};
