import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEventByIdAPI } from "../api/events";
import { getSeatsByEventAPI, lockSeatsAPI } from "../api/seats";
import { createBookingAPI, confirmBookingAPI } from "../api/bookings";
import useAuthStore from "../store/authStore";
import SeatMap from "../components/ui/SeatMap";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import EventRecommendations from "../components/ui/EventRecommendations";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState("select"); // select → confirm → done
  const [loading, setLoading] = useState(false);

  // Fetch event details
  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventByIdAPI(id).then((r) => r.data),
  });

  // Fetch seat map
  const {
    data: seatData,
    isLoading: seatLoading,
    refetch: refetchSeats,
  } = useQuery({
    queryKey: ["seats", id],
    queryFn: () => getSeatsByEventAPI(id).then((r) => r.data),
  });

  if (eventLoading || seatLoading) return <LoadingSpinner />;

  const event = eventData?.event;
  const seatMap = seatData?.seatMap || {};

  // Toggle seat selection
  const handleSeatClick = (seat) => {
    if (seat.status !== "available") return;

    setSelectedSeats(
      (prev) =>
        prev.includes(seat._id)
          ? prev.filter((id) => id !== seat._id) // deselect
          : prev.length >= 6
            ? (toast.error("Maximum 6 seats per booking"), prev) // limit
            : [...prev, seat._id], // select
    );
  };

  // Calculate total price
  const allSeats = Object.values(seatMap).flat();
  const selectedSeatDetails = allSeats.filter((s) =>
    selectedSeats.includes(s._id),
  );
  const totalAmount = selectedSeatDetails.reduce((sum, s) => sum + s.price, 0);

  // Lock seats and create booking
  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Lock seats
      await lockSeatsAPI({ seatIds: selectedSeats, eventId: id });
      toast.success("Seats locked for 10 minutes!");

      // Step 2: Create booking
      const { data } = await createBookingAPI({
        eventId: id,
        seatIds: selectedSeats,
      });

      // Step 3: Simulate payment (we'll add Stripe later)
      await confirmBookingAPI(data.booking.id, {
        paymentId: "simulated_payment",
      });

      toast.success("🎉 Booking confirmed!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
      refetchSeats(); // refresh seat map
      setSelectedSeats([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Banner Image */}
      <div className="relative w-full h-[50vh] min-h-[400px] bg-[#18181b] overflow-hidden">
        {event?.image ? (
          <>
            <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent to-background flex items-center justify-center">
            <span className="text-9xl opacity-10">✦</span>
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        
        {/* Event Header Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl mb-12 animate-slide-up shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex-1">
              <span className="inline-block text-xs font-bold tracking-widest text-background bg-primary px-3 py-1.5 rounded-full uppercase mb-4">
                {event?.category}
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-primary mb-6">
                {event?.title}
              </h1>
              <p className="text-secondary text-lg leading-relaxed max-w-3xl">
                {event?.description}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-1 gap-4 md:min-w-[250px]">
              <div className="bg-[#18181b]/80 border border-accent rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-secondary mb-1">Date & Time</p>
                <p className="text-primary font-medium">{new Date(event?.date).toDateString()}</p>
                <p className="text-primary font-medium">{event?.time}</p>
              </div>
              <div className="bg-[#18181b]/80 border border-accent rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-secondary mb-1">Venue</p>
                <p className="text-primary font-medium">{event?.venue?.name}</p>
                <p className="text-secondary text-sm">{event?.venue?.city}</p>
              </div>
              <div className="bg-[#18181b]/80 border border-accent rounded-2xl p-5 col-span-2 md:col-span-1 flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase tracking-widest text-secondary mb-1">Availability</p>
                  <p className="text-primary font-medium">{event?.availableSeats} Seats Left</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-accent flex items-center justify-center text-secondary">🪑</div>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Selection & Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Seat Map */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-10 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-accent/50">
              <h2 className="text-2xl font-semibold tracking-tight text-primary">Select Seats</h2>
              <div className="flex items-center gap-4 text-xs font-medium text-secondary tracking-wider uppercase">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent"></span>Available</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span>Selected</div>
              </div>
            </div>
            
            <div className="overflow-x-auto pb-4">
              <SeatMap
                seatMap={seatMap}
                selectedSeats={selectedSeats}
                onSeatClick={handleSeatClick}
              />
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="glass-panel rounded-3xl p-6 sm:p-8 sticky top-28">
              <h2 className="text-xl font-semibold tracking-tight text-primary mb-6">Booking Summary</h2>

              {selectedSeatDetails.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-accent rounded-xl mb-6">
                  <p className="text-secondary text-sm">No seats selected</p>
                </div>
              ) : (
                <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {selectedSeatDetails.map((seat) => (
                    <div key={seat._id} className="flex justify-between items-center bg-[#18181b]/50 border border-accent rounded-lg p-3 text-sm">
                      <div>
                        <span className="text-primary font-medium block">Seat {seat.seatNumber}</span>
                        <span className="text-secondary text-xs uppercase tracking-wider">{seat.category}</span>
                      </div>
                      <span className="text-primary font-medium tracking-wide">
                        LKR {seat.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-accent/50 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-secondary text-sm uppercase tracking-wider font-medium">Total</span>
                  <span className="text-3xl font-bold tracking-tighter text-primary">
                    <span className="text-lg text-secondary font-medium mr-1">LKR</span>
                    {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={selectedSeats.length === 0 || loading}
                className="btn-primary w-full py-4 text-base tracking-wide flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    Checkout {selectedSeats.length > 0 && `(${selectedSeats.length})`}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-secondary/80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <span>Seats are reserved for 10 minutes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-accent/50 pt-16">
          <EventRecommendations
            title="More Like This"
            fetchUrl={`/ai/recommendations/similar/${id}`}
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
