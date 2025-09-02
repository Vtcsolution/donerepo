import { Check, CheckCheck } from "lucide-react";

export default function Messagebubble({ message, isMe }) {
  function formatTime(dateString) {
    const date = new Date(dateString);
    return !isNaN(date)
      ? date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "Unknown";
  }

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={`relative max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
          isMe
            ? "bg-[#dcf8c6] text-black rounded-br-none"
            : "bg-white text-black rounded-bl-none"
        }`}
      >
        {/* Message Text */}
        <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>

        {/* Timestamp and Status */}
        <div
          className={`mt-1 flex items-center gap-1 text-[10px] ${
            isMe ? "justify-end text-gray-600" : "justify-start text-gray-400"
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isMe && (
            <>
              {message.status === "sent" && <Check className="h-3 w-3" />}
              {message.status === "delivered" && <CheckCheck className="h-3 w-3" />}
              {message.status === "read" && (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
