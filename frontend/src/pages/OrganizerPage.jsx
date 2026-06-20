import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyEventsAPI, deleteEventAPI, publishEventAPI } from '../api/events';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const OrganizerPage = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => getMyEventsAPI().then((r) => r.data),
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (id) => publishEventAPI(id),
    onSuccess: () => {
      toast.success('Event published successfully!');
      queryClient.invalidateQueries(['my-events']); // refresh list
    },
    onError: () => toast.error('Failed to publish event'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEventAPI(id),
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries(['my-events']);
      setDeletingId(null);
    },
    onError: () => toast.error('Failed to delete event'),
  });

  const handleDelete = (id) => {
    const confirm = window.confirm('Are you sure? This will also delete all seats for this event.');
    if (confirm) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const events = data?.events || [];

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">My Events</h1>
            <p className="text-secondary text-lg font-light">Manage your experiences and track sales.</p>
          </div>
          <Link to="/organizer/create" className="btn-primary flex items-center gap-2 px-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Create Experience
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {[
            { label: 'Total Events',     value: events.length,                                 icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { label: 'Published',        value: events.filter((e) => e.isPublished).length,    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Draft',            value: events.filter((e) => !e.isPublished).length,   icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
            { label: 'Total Seats',      value: events.reduce((s, e) => s + e.totalSeats, 0),  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel text-center py-6 px-4 rounded-2xl group hover:border-gray-600 transition-colors">
              <svg className="w-6 h-6 text-secondary mx-auto mb-3 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={stat.icon}></path>
              </svg>
              <p className="text-3xl font-bold tracking-tighter text-primary mb-1">{stat.value}</p>
              <p className="text-secondary text-xs uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="glass-panel text-center py-24 rounded-3xl animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="w-16 h-16 border border-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <p className="text-xl font-medium text-primary mb-2">No events created</p>
            <p className="text-secondary mb-8">Start by creating your first experience.</p>
            <Link to="/organizer/create" className="btn-primary inline-flex items-center gap-2">
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            {events.map((event) => (
              <div key={event._id} className="glass-panel rounded-2xl p-6 group hover:border-gray-600 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6 lg:items-center">

                  {/* Event Image */}
                  <div className="w-full lg:w-48 h-32 bg-[#18181b] rounded-xl overflow-hidden flex-shrink-0 relative">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/30 text-secondary">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md ${
                        event.isPublished
                          ? 'bg-primary/90 text-background'
                          : 'bg-accent/90 text-secondary'
                      }`}>
                        {event.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight text-primary mb-3 group-hover:text-white transition-colors">{event.title}</h3>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary font-medium mb-5">
                      <div className="flex items-center gap-2">
                        <span className="opacity-60">Date</span>
                        <span className="text-primary">{new Date(event.date).toDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="opacity-60">Venue</span>
                        <span className="text-primary">{event.venue?.name}</span>
                      </div>
                    </div>

                    {/* Seats progress bar */}
                    <div className="w-full max-w-md">
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-secondary uppercase tracking-wider">Seats Sold</span>
                        <span className="text-primary">{event.totalSeats - event.availableSeats} / {event.totalSeats}</span>
                      </div>
                      <div className="w-full bg-[#18181b] rounded-full h-1.5 border border-accent/50 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col gap-3 flex-shrink-0 w-full lg:w-40 border-t lg:border-t-0 lg:border-l border-accent/50 pt-5 lg:pt-0 lg:pl-6">
                    <Link
                      to={`/events/${event._id}`}
                      className="btn-secondary w-full text-center text-sm"
                    >
                      View
                    </Link>

                    {!event.isPublished && (
                      <button
                        onClick={() => publishMutation.mutate(event._id)}
                        disabled={publishMutation.isPending}
                        className="btn-primary w-full text-sm"
                      >
                        Publish
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(event._id)}
                      disabled={deletingId === event._id}
                      className="w-full border border-red-900/50 hover:bg-red-900/20 text-red-400 font-medium text-sm py-2 px-4 rounded-md transition-colors text-center"
                    >
                      {deletingId === event._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default OrganizerPage;