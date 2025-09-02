import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useAuth } from "@/All_Components/screen/AuthContext";
import { useParams } from "react-router-dom";

function formatTime(date) {
  if (!date) return "New";
  try {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "New";
  }
}

export default function PsychicList({ psychics = [], onSelectPsychic, selectedPsychicId, isLoading }) {
  // Ensure psychics is always an array
  const psychicList = Array.isArray(psychics) 
    ? psychics 
    : (psychics?.data || []);

  const { user } = useAuth();
const { psychicId } = useParams();

useEffect(() => {
  const init = async () => {
    if (!psychicId) return;

    // Find in existing list
    let selected = psychics.find(p => p._id === psychicId);

    // If not found, fetch from backend
    if (!selected) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/psychics/${psychicId}`
        );
        selected = res.data?.data;
      } catch (error) {
        console.error("Failed to fetch psychic by ID:", error);
      }
    }

    // Pass to parent
    if (selected && onSelectPsychic) {
      handleSelect(selected); // 👈 use the same function
    }
  };

  init();
}, [psychicId, psychics]);

  // In PsychicList.js
const handleSelect = async (psychic) => {
  if (!psychic?._id || isLoading) return;
  
  try {
    const chatRes = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/chat/${psychic._id}`,
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );
    
    // Transform messages to match frontend structure
    const transformedMessages = (chatRes.data?.messages || []).map(msg => ({
      _id: msg._id || msg.id,
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
      timestamp: msg.createdAt || new Date().toISOString()
    }));

    if (onSelectPsychic) {
      onSelectPsychic({
        ...psychic,
        messages: transformedMessages
      });
    }
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    if (onSelectPsychic) {
      onSelectPsychic({
        ...psychic,
        messages: []
      });
    }
  }
};
console.log("selected ai psychics", selectedPsychicId)
  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search psychics..."
            className="pl-9"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {psychicList.map(psychic =>(
          <div
            key={psychic._id}
            className={`cursor-pointer border-b border-border p-4 transition-colors hover:bg-accent/50 ${
              psychic._id === selectedPsychicId ? "bg-accent" : ""
            }`}
            onClick={() => handleSelect(psychic)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={psychic.image} alt={psychic.name} />
                <AvatarFallback>{psychic.name?.substring(0, 2) || "PS"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{psychic.name || "Psychic"}</h3>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(psychic.lastMessageAt)}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {psychic.type || "Specialist"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}