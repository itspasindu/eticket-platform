const SeatMap = ({ seatMap, selectedSeats, onSeatClick }) => {
  // Color coding for seat status
  const getSeatStyle = (seat) => {
    if (seat.status === 'booked') {
      return 'bg-red-900 text-red-400 cursor-not-allowed border-red-800';
    }
    if (seat.status === 'locked') {
      return 'bg-yellow-900 text-yellow-400 cursor-not-allowed border-yellow-800';
    }
    if (selectedSeats.includes(seat._id)) {
      return 'bg-primary text-white cursor-pointer border-indigo-400 scale-110';
    }
    // available — color by category
    if (seat.category === 'VIP') {
      return 'bg-purple-900/50 text-purple-300 cursor-pointer border-purple-700 hover:bg-purple-700';
    }
    if (seat.category === 'Regular') {
      return 'bg-blue-900/50 text-blue-300 cursor-pointer border-blue-700 hover:bg-blue-700';
    }
    return 'bg-gray-800 text-gray-300 cursor-pointer border-gray-600 hover:bg-gray-600';
  };

  return (
    <div className="space-y-4">

      {/* Stage */}
      <div className="w-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 border border-primary/50 rounded-xl py-3 text-center text-primary font-bold tracking-widest text-sm mb-8">
        🎭 STAGE
      </div>

      {/* Seat Grid — row by row */}
      {Object.entries(seatMap).map(([row, seats]) => (
        <div key={row} className="flex items-center gap-2">

          {/* Row Label */}
          <span className="text-gray-500 font-bold w-6 text-sm text-center">
            {row}
          </span>

          {/* Seats in this row */}
          <div className="flex gap-1.5 flex-wrap">
            {seats.map((seat) => (
              <button
                key={seat._id}
                onClick={() => onSeatClick(seat)}
                disabled={seat.status !== 'available'}
                className={`
                  w-9 h-9 rounded-md border text-xs font-bold
                  transition-all duration-150
                  ${getSeatStyle(seat)}
                `}
                title={`${seat.seatNumber} - ${seat.category} - LKR ${seat.price}`}
              >
                {seat.seatNumber.replace(row, '')}
              </button>
            ))}
          </div>

        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-800 text-xs">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-gray-800 border border-gray-600"></span>
          Economy
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-blue-900/50 border border-blue-700"></span>
          Regular
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-purple-900/50 border border-purple-700"></span>
          VIP
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-primary border border-indigo-400"></span>
          Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-900 border border-red-800"></span>
          Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-900 border border-yellow-800"></span>
          Locked
        </span>
      </div>

    </div>
  );
};

export default SeatMap;