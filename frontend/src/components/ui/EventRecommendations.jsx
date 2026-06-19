import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import API from "../../api/axios";

export default function EventRecommendations({ title, fetchUrl }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!fetchUrl) return;
    API.get(fetchUrl)
      .then(({ data }) => setEvents(data))
      .catch(() => setEvents([]));
  }, [fetchUrl]);

  if (events.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>

      {/* Horizontal scroll container */}
      <div className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide">
        {events.map((event) => (
          <div key={event._id} className="min-w-[300px] max-w-[300px]">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
