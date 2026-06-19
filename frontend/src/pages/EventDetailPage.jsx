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
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Event Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Image */}
        <div className="lg:col-span-1">
          <div className="w-full h-64 bg-gray-800 rounded-xl overflow-hidden">
            {event?.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">
                🎪
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <span className="text-xs font-semibold bg-primary/20 text-primary px-3 py-1 rounded-full uppercase">
            {event?.category}
          </span>
          <h1 className="text-4xl font-extrabold text-white mt-3 mb-4">
            {event?.title}
          </h1>
          <p className="text-gray-400 mb-6">{event?.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="card py-3 px-4">
              <p className="text-gray-500">📅 Date & Time</p>
              <p className="text-white font-semibold">
                {new Date(event?.date).toDateString()} · {event?.time}
              </p>
            </div>
            <div className="card py-3 px-4">
              <p className="text-gray-500">📍 Venue</p>
              <p className="text-white font-semibold">
                {event?.venue?.name}, {event?.venue?.city}
              </p>
            </div>
            <div className="card py-3 px-4">
              <p className="text-gray-500">🪑 Available Seats</p>
              <p className="text-white font-semibold">
                {event?.availableSeats}
              </p>
            </div>
            <div className="card py-3 px-4">
              <p className="text-gray-500">🎤 Organizer</p>
              <p className="text-white font-semibold">
                {event?.organizer?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2 card overflow-x-auto">
          <h2 className="text-xl font-bold text-white mb-6">
            Select Your Seats
          </h2>
          <SeatMap
            seatMap={seatMap}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4">
              Booking Summary
            </h2>

            {selectedSeatDetails.length === 0 ? (
              <p className="text-gray-500 text-sm">No seats selected yet</p>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedSeatDetails.map((seat) => (
                  <div key={seat._id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Seat {seat.seatNumber} ({seat.category})
                    </span>
                    <span className="text-white font-semibold">
                      LKR {seat.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-300">Total</span>
                <span className="text-primary">
                  LKR {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0 || loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : `Book ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? "s" : ""}`}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              🔒 Seats held for 10 minutes after selection
            </p>
          </div>
        </div>
      </div>
      <EventRecommendations
        title="Similar Events"
        fetchUrl={`/ai/recommendations/similar/${id}`}
      />
    </div>
  );
};

export default EventDetailPage;
