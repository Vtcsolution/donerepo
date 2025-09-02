import { Check, CheckCheck } from "lucide-react"

export default function MessageBubble({ message, isMe }) {
  function formatTime(dateString) {
    const date = new Date(dateString) // ✅ Convert to Date object
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-lg px-4 py-2 shadow-sm ${
          isMe ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-xs ${
            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isMe && (
            <>
              {message.status === "sent" && <Check className="h-3 w-3" />}
              {message.status === "delivered" && <CheckCheck className="h-3 w-3" />}
              {message.status === "read" && <CheckCheck className="h-3 w-3 text-blue-400" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
