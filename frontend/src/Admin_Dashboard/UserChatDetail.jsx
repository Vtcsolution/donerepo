/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Timer } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Dashboard_Navbar from "./Admin_Navbar";
import Doctor_Side_Bar from "./SideBar";
import { useAdminAuth } from "@/context/AdminAuthContext";
import Messagebubble from "./Messagebubble";

export default function UserChatDetail({ onBack }) {
  const { chatId } = useParams();
  const { admin } = useAdminAuth();

  const [chat, setChat] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [timerDuration, setTimerDuration] = useState(0);
  const [side, setSide] = useState(false);

  // Fetch chat details only
  useEffect(() => {
    async function fetchChat() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/chat/admin/chat/${chatId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success) {
          setChat(data.chat);
        } else {
          console.error("Failed to load chat detail:", data.message);
        }
      } catch (err) {
        console.error("Error fetching chat:", err);
      }
    }
    fetchChat();
  }, [chatId]);

  const toggleTimer = () => {
    if (!timerActive) {
      const start = Date.now();
      setTimerStart(start);
      setTimerActive(true);
      const id = setInterval(() => {
        setTimerDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(id);
    } else {
      setTimerActive(false);
      setTimerStart(null);
      setTimerDuration(0);
    }
  };

  const formatTimer = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (!chat) return <p className="p-4">Loading chat...</p>;

  const { user, advisor: psychic, messages = [] } = chat;

  return (
    <div className="min-h-screen">
      <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
      <div className="dashboard-wrapper">
        <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
        <div className="dashboard-side flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center p-4 border-b gap-4">
           <Link to="/admin/dashboard/users-chat"> <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft />
            </Button>
            </Link>

            {/* Psychic Avatar */}
            <Avatar>
              <AvatarImage src={psychic?.image || "/default.jpg"} />
              <AvatarFallback>
                {psychic?.name?.slice(0, 2).toUpperCase() || "AI"}
              </AvatarFallback>
            </Avatar>

            <div className="text-base font-semibold flex-1">
              {psychic?.name || "Unknown Psychic"}
            </div>

            {/* User name */}
            <div className="text-sm text-muted-foreground mr-4">
              User: {user?.username || "Anonymous"}
            </div>

            {/* Timer Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={timerActive ? "destructive" : "outline"}
                    onClick={toggleTimer}
                  >
                    <Timer className="mr-1" />
                    {timerActive && formatTimer(timerDuration)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {timerActive ? "Stop" : "Start"} Timer
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Messages */}
<div className="p-4 space-y-2 overflow-y-auto" style={{ height: "calc(100vh - 180px)" , scrollBehavior: "smooth"}}>
           
             {messages.length === 0 ? (
  <p className="text-center text-gray-500">No messages yet.</p>
) : (
  messages.map((msg) => (
    <Messagebubble
      key={msg.id}
      message={{
        ...msg,
        timestamp: msg.createdAt || msg.timestamp || new Date(),
      }}
isMe={msg.sender === "user"}
    />
  ))

            )}
          </div>
        </div>
      </div>
    </div>
  );
}
