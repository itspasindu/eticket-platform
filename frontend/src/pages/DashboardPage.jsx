import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyBookingsAPI } from "../api/bookings";
import { getQRCodeAPI, sendTicketEmailAPI } from "../api/tickets";
import { getMeAPI } from "../api/auth";
import useAuthStore from "../store/authStore";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import EventRecommendations from "../components/ui/EventRecommendations";

const DashboardPage = () => {
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    getMeAPI().then((r) => setUser(r.data.user));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => getMyBookingsAPI().then((r) => r.data),
  });

  const [sendingEmail, setSendingEmail] = useState(null);

  const handleSendEmail = async (bookingId) => {
    setSendingEmail(bookingId);
    try {
      await sendTicketEmailAPI(bookingId);
      toast.success("Ticket sent to your email!");
    } catch {
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(null);
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading your tickets..." />;

  const bookings = data?.bookings || [];

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-3">My Tickets</h1>
          <p className="text-secondary text-lg font-light">All your curated experiences in one place.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-panel text-center py-24 rounded-2xl animate-slide-up">
            <div className="w-16 h-16 border border-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
            </div>
            <p className="text-xl text-primary font-medium mb-2">No experiences yet</p>
            <p className="text-secondary mb-8">You haven't booked any tickets yet.</p>
            <a href="/" className="btn-primary inline-flex items-center gap-2">
              Browse Experiences
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
            {bookings.map((booking) => (
              <div key={booking._id} className="glass-panel rounded-2xl overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Event Info */}
                  <div className="flex-1 p-8 md:border-r border-accent/50">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider ${
                          booking.status === "active" ? "bg-primary text-black" : 
                          booking.status === "used" ? "bg-accent text-secondary" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                        {booking.status}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-md uppercase tracking-wider border ${
                          booking.paymentStatus === "paid" ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"
                        }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>

                    <h3 className="text-3xl font-bold text-primary mb-4 tracking-tight">
                      {booking.event?.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-secondary mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center">📅</div>
                        <div>
                          <p className="text-primary font-medium">{new Date(booking.event?.date).toDateString()}</p>
                          <p>{booking.event?.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center">📍</div>
                        <div>
                          <p className="text-primary font-medium truncate">{booking.event?.venue?.name}</p>
                          <p>{booking.event?.venue?.city}</p>
                        </div>
                      </div>
                    </div>

                    {/* Seats */}
                    <div className="mb-8">
                      <p className="text-xs uppercase tracking-widest text-secondary mb-3">Selected Seats</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats?.map((seat) => (
                          <span key={seat._id} className="text-xs font-medium border border-accent px-3 py-1.5 rounded-md text-primary bg-[#18181b]/50">
                            {seat.seatNumber} <span className="text-secondary ml-1">{seat.category}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-accent/50">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-secondary mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          LKR {booking.totalAmount?.toLocaleString()}
                        </p>
                      </div>

                      {booking.paymentStatus === "paid" && (
                        <button
                          onClick={() => handleSendEmail(booking._id)}
                          disabled={sendingEmail === booking._id}
                          className="btn-secondary text-sm font-medium hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {sendingEmail === booking._id ? "Sending..." : "Email Ticket"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QR Code Section */}
                  {booking.paymentStatus === "paid" && (
                    <div className="w-full md:w-80 p-8 flex flex-col items-center justify-center bg-[#18181b]/30">
                      <div className="bg-white p-4 rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500 mb-6">
                        <QRCodeSVG
                          value={booking.ticketCode}
                          size={160}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="H"
                        />
                      </div>
                      <p className="text-xs font-medium tracking-wider text-secondary uppercase text-center mb-2">
                        Admit One
                      </p>
                      <p className="text-xs text-secondary/60 font-mono break-all text-center px-4">
                        {booking.ticketCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-24">
          <EventRecommendations
            title="Curated For You"
            fetchUrl={user ? `/ai/recommendations/personalized/${user._id}` : null}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
