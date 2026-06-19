import { useState } from "react";
import { chatAPI } from "../api/ai";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Welcome. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const formatMessage = (text) => {
    return text.split("\n").map((line, lineIndex) => (
      <span key={lineIndex}>
        {line
          .split("**")
          .map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
          )}
        <br />
      </span>
    ));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatAPI({
        message: input,
        history: updatedMessages,
      });
      setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      {/* Chat Window */}
      {open && (
        <div className="mb-3 w-80 rounded-2xl shadow-2xl border border-[#6366f1] bg-white flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#6366f1] text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-sm">Support Chat</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white text-lg leading-none"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto max-h-72 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-sm max-w-[75%] ${
                    msg.from === "user"
                      ? "bg-[#6366f1] text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl text-sm bg-white border border-gray-200 text-gray-400">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center border-t border-gray-200 px-3 py-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-[#6366f1] hover:bg-[#6366f1] text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              &#9658;
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-[#6366f1] hover:bg-[#6366f1] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl"
      >
        💬
      </button>
    </div>
  );
}
