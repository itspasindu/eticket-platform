import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyBookingsAPI } from '../api/bookings';
import { getQRCodeAPI, sendTicketEmailAPI } from '../api/tickets';
import { getMeAPI } from '../api/auth';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const DashboardPage = () => {
  const { setUser } = useAuthStore();

  // Load user profile
  useEffect(() => {
    getMeAPI().then((r) => setUser(r.data.user));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => getMyBookingsAPI().then((r) => r.data),
  });

  const [sendingEmail, setSendingEmail] = useState(null);

  const handleSendEmail = async (bookingId) => {
    setSendingEmail(bookingId);
    try {
      await sendTicketEmailAPI(bookingId);
      toast.success('Ticket sent to your email!');
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const bookings = data?.bookings || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
      <p className="text-gray-400 mb-8">All your bookings in one place</p>

      {bookings.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🎫</p>
          <p className="text-xl text-gray-400">No tickets yet</p>
          <a href="/" className="btn-primary inline-block mt-4">Browse Events</a>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Event Info */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      booking.status === 'active' ? 'bg-green-900 text-green-400' :
                      booking.status === 'used'   ? 'bg-gray-700 text-gray-400' :
                      'bg-red-900 text-red-400'
                    }`}>
                      {booking.status.toUpperCase()}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      booking.paymentStatus === 'paid' ? 'bg-blue-900 text-blue-400' :
                      'bg-yellow-900 text-yellow-400'
                    }`}>
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-2">
                    {booking.event?.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    📅 {new Date(booking.event?.date).toDateString()} · {booking.event?.time}
                  </p>
                  <p className="text-gray-400 text-sm">
                    📍 {booking.event?.venue?.name}, {booking.event?.venue?.city}
                  </p>

                  {/* Seats */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {booking.seats?.map((seat) => (
                      <span key={seat._id} className="text-xs bg-gray-800 border border-gray-700 px-2 py-1 rounded-md text-gray-300">
                        {seat.seatNumber} · {seat.category}
                      </span>
                    ))}
                  </div>

                  <p className="text-primary font-bold mt-3">
                    Total: LKR {booking.totalAmount?.toLocaleString()}
                  </p>

                  {/* Actions */}
                  {booking.paymentStatus === 'paid' && (
                    <button
                      onClick={() => handleSendEmail(booking._id)}
                      disabled={sendingEmail === booking._id}
                      className="btn-secondary text-sm py-1.5 px-4 mt-4"
                    >
                      {sendingEmail === booking._id ? 'Sending...' : '📧 Send to Email'}
                    </button>
                  )}
                </div>

                {/* QR Code */}
                {booking.paymentStatus === 'paid' && (
                  <div className="flex flex-col items-center justify-center">
                    <QRCodeSVG
                      value={booking.ticketCode}
                      size={140}
                      bgColor="#111827"
                      fgColor="#ffffff"
                      level="H"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Show at venue entrance
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-mono break-all text-center">
                      {booking.ticketCode?.slice(0, 8)}...
                    </p>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default DashboardPage;