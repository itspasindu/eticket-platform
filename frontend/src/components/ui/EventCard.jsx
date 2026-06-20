import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date).toDateString();

  return (
    <Link to={`/events/${event._id}`} className="block group">
      <div className="bg-[#0e0e11] border border-accent rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Event Image */}
        <div className="relative w-full h-56 bg-[#18181b] overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/30 text-4xl">
              ✦
            </div>
          )}
          {/* Category Badge overlay */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-primary text-xs font-semibold px-3 py-1.5 rounded-md uppercase tracking-wider border border-white/10">
            {event.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-primary tracking-tight leading-tight group-hover:text-white transition-colors">
              {event.title}
            </h3>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-secondary font-medium">
            <div className="flex items-center gap-2">
              <span className="opacity-60">Date</span>
              <span className="text-primary">{eventDate} • {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-60">Venue</span>
              <span className="text-primary truncate">{event.venue?.name}, {event.venue?.city}</span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-accent">
            <div className="text-sm font-medium">
              <span className={event.availableSeats > 0 ? "text-primary" : "text-red-400"}>
                {event.availableSeats > 0 ? `${event.availableSeats} spots left` : 'Sold Out'}
              </span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              Details <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default EventCard;