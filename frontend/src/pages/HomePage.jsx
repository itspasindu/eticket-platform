import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEventsAPI } from '../api/events';
import EventCard from '../components/ui/EventCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EventRecommendations from "../components/ui/EventRecommendations";
import useAuthStore from "../store/authStore";

const HomePage = () => {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');

  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['events', search, category],
    queryFn: () => getEventsAPI({ search, category }).then((r) => r.data),
  });

  const categories = ['concert', 'sports', 'theater', 'comedy', 'other'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white mb-4">
          Find Your Next <span className="text-primary">Experience</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Book tickets for concerts, sports, theater and more across Sri Lanka
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <input
          type="text"
          placeholder="🔍 Search events..."
          className="input flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input md:w-48"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading events..." />
      ) : data?.events?.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🎭</p>
          <p className="text-xl">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.events?.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      <EventRecommendations
        title="Recommended For You"
        fetchUrl={user ? `http://localhost:5001/recommendations/personalized/${user._id}` : null}
      />
      
    </div>
  );
};

export default HomePage;