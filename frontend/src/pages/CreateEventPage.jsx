import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEventAPI, publishEventAPI } from '../api/events';
import toast from 'react-hot-toast';
import AIDescriptionGenerator from "../components/ui/AIDescriptionGenerator";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'concert',
    date: '',
    time: '',
    image: '',
    venue: {
      name: '',
      address: '',
      city: '',
    },
    ticketCategories: [
      { category: 'VIP',     rows: ['A', 'B'],           seatsPerRow: 5,  price: 5000 },
      { category: 'Regular', rows: ['C', 'D', 'E'],      seatsPerRow: 10, price: 2500 },
      { category: 'Economy', rows: ['F', 'G', 'H', 'I'], seatsPerRow: 15, price: 1000 },
    ],
  });

  // Handle top level field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle nested venue field changes
  const handleVenueChange = (e) => {
    setForm({
      ...form,
      venue: { ...form.venue, [e.target.name]: e.target.value },
    });
  };

  // Handle ticket category field changes
  const handleTicketChange = (index, field, value) => {
    const updated = [...form.ticketCategories];
    if (field === 'rows') {
      // rows comes as comma separated string → convert to array
      updated[index][field] = value.split(',').map((r) => r.trim().toUpperCase());
    } else if (field === 'seatsPerRow' || field === 'price') {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setForm({ ...form, ticketCategories: updated });
  };

  // Calculate total seats preview
  const totalSeats = form.ticketCategories.reduce((sum, cat) => {
    return sum + cat.rows.length * cat.seatsPerRow;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create event
      const { data } = await createEventAPI(form);
      const eventId = data.event._id;

      toast.success(`Event created! ${data.seatsCreated} seats generated.`);

      // Ask if they want to publish immediately
      const publish = window.confirm(
        'Event created successfully! Do you want to publish it now so users can see it?'
      );

      if (publish) {
        await publishEventAPI(eventId);
        toast.success('Event published! 🎉');
      }

      navigate('/organizer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        <p className="text-gray-400 mt-1">Fill in the details to create your event and generate seats</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Basic Info */}
        <div className="card space-y-5">
          <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">
            📋 Basic Information
          </h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Event Title</label>
            <input
              type="text"
              name="title"
              className="input"
              placeholder="e.g. Colombo Music Festival 2025"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm text-gray-400">Description</label>
              <AIDescriptionGenerator
                eventName={form.title}
                category={form.category}
                date={form.date}
                onGenerated={(text) => setForm({ ...form, description: text })}
              />
            </div>
            <textarea
              name="description"
              className="input min-h-[120px] resize-none"
              placeholder="Tell people what to expect at this event..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Category</label>
              <select
                name="category"
                className="input"
                value={form.category}
                onChange={handleChange}
              >
                <option value="concert">🎵 Concert</option>
                <option value="sports">⚽ Sports</option>
                <option value="theater">🎭 Theater</option>
                <option value="comedy">😂 Comedy</option>
                <option value="other">🎪 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Event Image URL</label>
              <input
                type="url"
                name="image"
                className="input"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Date</label>
              <input
                type="date"
                name="date"
                className="input"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Time</label>
              <input
                type="text"
                name="time"
                className="input"
                placeholder="e.g. 7:00 PM"
                value={form.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="card space-y-5">
          <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-3">
            📍 Venue Details
          </h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Venue Name</label>
            <input
              type="text"
              name="name"
              className="input"
              placeholder="e.g. Nelum Pokuna Mahinda Rajapaksa Theatre"
              value={form.venue.name}
              onChange={handleVenueChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Address</label>
              <input
                type="text"
                name="address"
                className="input"
                placeholder="e.g. Ananda Coomaraswamy Mawatha"
                value={form.venue.address}
                onChange={handleVenueChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">City</label>
              <input
                type="text"
                name="city"
                className="input"
                placeholder="e.g. Colombo"
                value={form.venue.city}
                onChange={handleVenueChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Ticket Categories */}
        <div className="card space-y-5">
          <div className="flex items-center justify-between border-b border-gray-700 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white">🎫 Ticket Categories & Seats</h2>
              <p className="text-gray-500 text-sm mt-1">
                Total seats that will be generated: <span className="text-primary font-bold">{totalSeats}</span>
              </p>
            </div>
          </div>

          {form.ticketCategories.map((cat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-5 space-y-4">

              {/* Category Header */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  cat.category === 'VIP'     ? 'bg-purple-900 text-purple-300' :
                  cat.category === 'Regular' ? 'bg-blue-900 text-blue-300' :
                                               'bg-gray-700 text-gray-300'
                }`}>
                  {cat.category}
                </span>
                <span className="text-gray-500 text-sm">
                  {cat.rows.length} rows × {cat.seatsPerRow} seats = {cat.rows.length * cat.seatsPerRow} seats
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Rows (comma separated)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="A, B, C"
                    value={cat.rows.join(', ')}
                    onChange={(e) => handleTicketChange(index, 'rows', e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    e.g. "A, B" creates rows A and B
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Seats Per Row
                  </label>
                  <input
                    type="number"
                    className="input"
                    min="1"
                    max="50"
                    value={cat.seatsPerRow}
                    onChange={(e) => handleTicketChange(index, 'seatsPerRow', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    value={cat.price}
                    onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                  />
                </div>

              </div>
            </div>
          ))}

          {/* Seat Preview */}
          <div className="bg-gray-800/50 rounded-lg p-4 text-sm">
            <p className="text-gray-400 font-semibold mb-2">📊 Seat Generation Preview</p>
            {form.ticketCategories.map((cat, i) => (
              <div key={i} className="flex justify-between text-gray-500 py-1 border-b border-gray-700/50">
                <span>{cat.category} — Rows: {cat.rows.join(', ')}</span>
                <span>{cat.rows.length} × {cat.seatsPerRow} = <span className="text-white font-bold">{cat.rows.length * cat.seatsPerRow} seats</span></span>
              </div>
            ))}
            <div className="flex justify-between mt-2 font-bold">
              <span className="text-gray-300">Total</span>
              <span className="text-primary">{totalSeats} seats</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/organizer')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? 'Creating Event...' : '🚀 Create Event'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateEventPage;