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
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-3">Create Experience</h1>
          <p className="text-secondary text-lg font-light">Fill in the details to curate your next event and generate seats.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up" style={{ animationDelay: "100ms" }}>

          {/* Basic Info */}
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-semibold tracking-tight text-primary border-b border-accent/50 pb-4 mb-6 uppercase">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Event Title</label>
              <input
                type="text"
                name="title"
                className="input bg-[#18181b]/50"
                placeholder="e.g. Colombo Music Festival 2025"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-secondary uppercase tracking-wider">Description</label>
                <AIDescriptionGenerator
                  eventName={form.title}
                  category={form.category}
                  date={form.date}
                  onGenerated={(text) => setForm({ ...form, description: text })}
                />
              </div>
              <textarea
                name="description"
                className="input bg-[#18181b]/50 min-h-[120px] resize-none"
                placeholder="Tell people what to expect at this experience..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    className="input bg-[#18181b]/50 appearance-none pr-10 cursor-pointer"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="concert" className="bg-background">Concert</option>
                    <option value="sports" className="bg-background">Sports</option>
                    <option value="theater" className="bg-background">Theater</option>
                    <option value="comedy" className="bg-background">Comedy</option>
                    <option value="other" className="bg-background">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Image URL</label>
                <input
                  type="url"
                  name="image"
                  className="input bg-[#18181b]/50"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  name="date"
                  className="input bg-[#18181b]/50"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Time</label>
                <input
                  type="text"
                  name="time"
                  className="input bg-[#18181b]/50"
                  placeholder="e.g. 7:00 PM"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-semibold tracking-tight text-primary border-b border-accent/50 pb-4 mb-6 uppercase">
              Venue Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Venue Name</label>
              <input
                type="text"
                name="name"
                className="input bg-[#18181b]/50"
                placeholder="e.g. Nelum Pokuna Mahinda Rajapaksa Theatre"
                value={form.venue.name}
                onChange={handleVenueChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Address</label>
                <input
                  type="text"
                  name="address"
                  className="input bg-[#18181b]/50"
                  placeholder="e.g. Ananda Coomaraswamy Mawatha"
                  value={form.venue.address}
                  onChange={handleVenueChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  name="city"
                  className="input bg-[#18181b]/50"
                  placeholder="e.g. Colombo"
                  value={form.venue.city}
                  onChange={handleVenueChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Ticket Categories */}
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-accent/50 pb-4 mb-6 gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-primary uppercase">Ticket Categories</h2>
              <p className="text-secondary text-sm font-medium tracking-wide">
                Total seats: <span className="text-primary font-bold ml-1">{totalSeats}</span>
              </p>
            </div>

            {form.ticketCategories.map((cat, index) => (
              <div key={index} className="bg-[#18181b]/50 border border-accent/50 rounded-xl p-6 space-y-5">

                {/* Category Header */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider bg-background border border-accent text-primary">
                    {cat.category}
                  </span>
                  <span className="text-secondary text-sm font-medium">
                    {cat.rows.length} rows × {cat.seatsPerRow} seats = <span className="text-primary">{cat.rows.length * cat.seatsPerRow} seats</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">
                      Rows (comma separated)
                    </label>
                    <input
                      type="text"
                      className="input bg-background"
                      placeholder="A, B, C"
                      value={cat.rows.join(', ')}
                      onChange={(e) => handleTicketChange(index, 'rows', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">
                      Seats Per Row
                    </label>
                    <input
                      type="number"
                      className="input bg-background"
                      min="1"
                      max="50"
                      value={cat.seatsPerRow}
                      onChange={(e) => handleTicketChange(index, 'seatsPerRow', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2 uppercase tracking-wider">
                      Price (LKR)
                    </label>
                    <input
                      type="number"
                      className="input bg-background"
                      min="0"
                      value={cat.price}
                      onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Seat Preview */}
            <div className="bg-[#18181b] border border-accent/50 rounded-xl p-6">
              <p className="text-xs text-secondary font-bold mb-4 tracking-widest uppercase">Seat Generation Preview</p>
              <div className="space-y-3">
                {form.ticketCategories.map((cat, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-accent/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-secondary font-medium"><span className="text-primary">{cat.category}</span> — Rows: {cat.rows.join(', ')}</span>
                    <span className="text-secondary">{cat.rows.length} × {cat.seatsPerRow} = <span className="text-primary font-bold ml-1">{cat.rows.length * cat.seatsPerRow}</span></span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-accent font-bold">
                <span className="text-secondary uppercase tracking-widest text-xs">Total Capacity</span>
                <span className="text-xl text-primary">{totalSeats} <span className="text-sm font-medium text-secondary ml-1">seats</span></span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/organizer')}
              className="btn-secondary sm:w-48 py-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-4 text-lg tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Creating Event...</span>
              ) : (
                <>
                  Create Event
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;