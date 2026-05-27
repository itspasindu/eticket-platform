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
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Events</h1>
          <p className="text-gray-400 mt-1">Manage your events and track sales</p>
        </div>
        <Link to="/organizer/create" className="btn-primary flex items-center gap-2">
          ＋ Create Event
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events',     value: events.length,                                 icon: '🎪' },
          { label: 'Published',        value: events.filter((e) => e.isPublished).length,    icon: '✅' },
          { label: 'Draft',            value: events.filter((e) => !e.isPublished).length,   icon: '📝' },
          { label: 'Total Seats',      value: events.reduce((s, e) => s + e.totalSeats, 0),  icon: '🪑' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center py-4">
            <p className="text-3xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🎪</p>
          <p className="text-xl text-gray-400 mb-2">No events yet</p>
          <p className="text-gray-600 mb-6">Create your first event to get started</p>
          <Link to="/organizer/create" className="btn-primary inline-block">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="card hover:border-gray-700 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center gap-4">

                {/* Event Image */}
                <div className="w-full md:w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🎪</div>
                  )}
                </div>

                {/* Event Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-lg font-bold text-white">{event.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      event.isPublished
                        ? 'bg-green-900 text-green-400'
                        : 'bg-yellow-900 text-yellow-400'
                    }`}>
                      {event.isPublished ? '✅ Published' : '📝 Draft'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>📅 {new Date(event.date).toDateString()} · {event.time}</span>
                    <span>📍 {event.venue?.name}, {event.venue?.city}</span>
                    <span>🪑 {event.availableSeats}/{event.totalSeats} available</span>
                  </div>

                  {/* Seats progress bar */}
                  <div className="mt-2 w-full md:w-64">
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{
                          width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {event.totalSeats - event.availableSeats} seats sold
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 flex-shrink-0">

                  {/* View */}
                  <Link
                    to={`/events/${event._id}`}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    👁 View
                  </Link>

                  {/* Publish (only if draft) */}
                  {!event.isPublished && (
                    <button
                      onClick={() => publishMutation.mutate(event._id)}
                      disabled={publishMutation.isPending}
                      className="btn-primary text-sm py-1.5 px-3"
                    >
                      🚀 Publish
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(event._id)}
                    disabled={deletingId === event._id}
                    className="bg-red-900/50 hover:bg-red-800 text-red-400 font-semibold text-sm py-1.5 px-3 rounded-lg transition-colors"
                  >
                    {deletingId === event._id ? 'Deleting...' : '🗑 Delete'}
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default OrganizerPage;