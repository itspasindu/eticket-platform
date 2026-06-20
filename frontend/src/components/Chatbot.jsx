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

      if (!data || !data.reply) {
        throw new Error("Invalid response from server");
      }

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
        <div className="mb-3 w-80 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-accent bg-[#0e0e11] flex flex-col overflow-hidden animate-slide-up glass-panel">
          {/* Header */}
          <div className="border-b border-accent px-4 py-4 flex justify-between items-center bg-black/50">
            <span className="font-medium text-sm text-primary tracking-wide uppercase">Support</span>
            <button
              onClick={() => setOpen(false)}
              className="text-secondary hover:text-primary transition-colors text-lg leading-none"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-72 space-y-4 bg-transparent scrollbar-hide">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-lg text-sm max-w-[85%] leading-relaxed ${
                    msg.from === "user"
                      ? "bg-primary text-background font-medium"
                      : "bg-[#18181b] text-secondary border border-accent"
                  }`}
                >
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="px-4 py-2.5 rounded-lg text-sm bg-[#18181b] border border-accent text-secondary">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center border-t border-accent p-3 bg-black/50">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message..."
              className="flex-1 text-sm outline-none bg-transparent text-primary placeholder-accent px-2"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-primary hover:bg-white text-background rounded-md w-8 h-8 flex items-center justify-center transition-colors"
            >
              &#9658;
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-primary hover:bg-white text-background rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 transform hover:scale-105 group"
      >
        <svg className="w-6 h-6 text-background group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>
    </div>
  );
}
