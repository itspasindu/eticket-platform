import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventsAPI } from "../api/events";
import EventCard from "../components/ui/EventCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EventRecommendations from "../components/ui/EventRecommendations";
import useAuthStore from "../store/authStore";

const HomePage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["events", search, category],
    queryFn: () => getEventsAPI({ search, category }).then((r) => r.data),
  });

  const categories = ["concert", "sports", "theater", "comedy", "other"];

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-black pb-20">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[800px] h-[800px] bg-primary blur-[150px] rounded-full mix-blend-screen opacity-10 animate-pulse"></div>
        </div>
        
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-primary mb-6 animate-slide-up z-10">
          Experience <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">More.</span>
        </h1>
        <p className="text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-12 animate-slide-up font-light z-10" style={{ animationDelay: "100ms" }}>
          Curated events, concerts, and theater performances. <br className="hidden sm:block" /> Secure your tickets instantly.
        </p>

        {/* Search & Filter - Glassmorphism */}
        <div className="w-full max-w-4xl glass-panel rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 animate-slide-up z-10 shadow-2xl relative" style={{ animationDelay: "200ms" }}>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="w-full bg-[#18181b]/50 border border-accent rounded-xl pl-12 pr-4 py-4 text-primary placeholder-secondary focus:outline-none focus:border-primary transition-all duration-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <select
              className="w-full bg-[#18181b]/50 border border-accent rounded-xl px-4 py-4 text-primary appearance-none focus:outline-none focus:border-primary transition-all duration-300 cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" className="bg-background">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-background">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Trending Now</h2>
          <span className="h-px bg-accent flex-1 ml-6 hidden sm:block"></span>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Curating events..." />
          </div>
        ) : data?.events?.length === 0 ? (
          <div className="text-center py-32 border border-accent rounded-2xl bg-[#0e0e11]/50 backdrop-blur-sm">
            <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <p className="text-secondary text-lg">No experiences found for your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {data?.events?.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}

        <div className="mt-24 border-t border-accent pt-16">
          <EventRecommendations
            title="Curated For You"
            fetchUrl={user ? `/ai/recommendations/personalized/${user._id}` : null}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
