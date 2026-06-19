import { useState } from "react";
import { generateDescriptionAPI } from "../../api/ai";

export default function AIDescriptionGenerator({
  onGenerated,
  eventName,
  category,
  date,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    eventName: eventName || "",
    category: category || "",
    location: "",
    date: date || "",
    keyDetails: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await generateDescriptionAPI(form);
      if (data.description) {
        onGenerated(data.description); // sends text to description box
        setOpen(false); // closes popup
      }
    } catch (e) {
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button next to Description label */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs bg-[#6366f1] hover:bg-[#6366f1] text-white px-3 py-1 rounded-full"
      >
        ✨ Generate with AI
      </button>

      {/* Popup */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-semibold text-lg">
                Enter Event Details
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                &times;
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">Event Name</label>
                <input
                  name="eventName"
                  value={form.eventName}
                  onChange={handleChange}
                  placeholder="e.g. Colombo Music Festival"
                  className="w-full mt-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full mt-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700"
                >
                  <option value="concert">🎵 Concert</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="theater">🎭 Theater</option>
                  <option value="comedy">😂 Comedy</option>
                  <option value="other">🎪 Other</option>
                </select>

                {/* Show text input only when "Other" is selected */}
                {form.category === "other" && (
                  <input
                    name="category"
                    value={
                      form.category === "other" ? form.customCategory || "" : ""
                    }
                    onChange={(e) =>
                      setForm({ ...form, customCategory: e.target.value })
                    }
                    placeholder="Type your category..."
                    className="w-full mt-2 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700"
                  />
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm">Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Galle Face, Colombo"
                  className="w-full mt-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">Date</label>
                <input
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  placeholder="e.g. July 10, 2026"
                  className="w-full mt-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">Key Details</label>
                <textarea
                  name="keyDetails"
                  value={form.keyDetails}
                  onChange={handleChange}
                  placeholder="e.g. Live performers, fireworks show"
                  rows={3}
                  className="w-full mt-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700 resize-none"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="mt-4 w-full bg-[#6366f1] hover:bg-[#6366f1] text-white py-2 rounded-xl font-semibold text-sm"
            >
              {loading ? "Generating..." : "Generate Description"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
