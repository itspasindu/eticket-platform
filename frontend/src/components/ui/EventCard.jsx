import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date).toDateString();

  return (
    <Link to={`/events/${event._id}`}>
      <div className="card hover:border-primary transition-all duration-200 cursor-pointer group">

        {/* Event Image */}
        <div className="w-full h-48 bg-gray-800 rounded-lg mb-4 overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🎪
            </div>
          )}
        </div>

        {/* Category Badge */}
        <span className="text-xs font-semibold bg-primary/20 text-primary px-3 py-1 rounded-full uppercase">
          {event.category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mt-2 mb-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Details */}
        <div className="text-sm text-gray-400 space-y-1 mt-3">
          <p>📅 {eventDate} · {event.time}</p>
          <p>📍 {event.venue?.name}, {event.venue?.city}</p>
          <p>🪑 {event.availableSeats} seats available</p>
        </div>

      </div>
    </Link>
  );
};

export default EventCard;