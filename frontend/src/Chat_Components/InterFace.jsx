"use client";
import { useState, useEffect } from "react";
import ChatList from "./CharList";
import ChatDetail from "./ChatDetail";
import { useMediaQuery } from "./Query";
import axios from "axios";
import { useAuth } from "@/All_Components/screen/AuthContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function InterFace() {
    const navigate = useNavigate();

  const [selectedChat, setSelectedChat] = useState(null);
  const [psychics, setPsychics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
   const { psychicId } = useParams();

useEffect(() => {
  const fetchPsychics = async () => {
    if (!user?._id) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/psychics/user/${user._id}`
      );

      const chatPsychics = res.data.data || [];
      setPsychics(chatPsychics);

      if (!isMobile && chatPsychics.length > 0) {
        let selected = null;

        if (psychicId) {
          // If psychicId exists in chatPsychics
          selected = chatPsychics.find((p) => p._id === psychicId);

          // If not, try fetching it directly (first-time chat)
          if (!selected) {
            const singlePsychicRes = await axios.get(
              `${import.meta.env.VITE_BASE_URL}/api/psychics/${psychicId}`
            );
            selected = singlePsychicRes.data.data;
          }
        }

        await handlePsychicSelect(selected || chatPsychics[0]);
      }
    } catch (error) {
      console.error("Failed to fetch psychics or selected psychic:", error);
      setPsychics([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchPsychics();
}, [isMobile, user?._id, psychicId]);


 // In InterFace.js
const handlePsychicSelect = async (psychic) => {
    if (!psychic?._id) return;
    
    // Update URL first
    navigate(`/chat/${psychic._id}`);
  try {
    setIsLoading(true);
    const chatRes = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/chat/${psychic._id}`,
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );
    // Transform messages to match expected structure
    const transformedMessages = (chatRes.data?.messages || []).map(msg => ({
      _id: msg._id || msg.id,
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
      timestamp: msg.createdAt || new Date().toISOString()
    }));

    setSelectedChat({
      ...psychic,
      messages: transformedMessages
    });

    if (isMobile) setShowMobileChat(true);
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    setSelectedChat({
      ...psychic,
      messages: []
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleBackToList = () => {
    if (isMobile) setShowMobileChat(false);
  };

 const handleSendMessage = async (messageContent) => {
  if (!selectedChat || !messageContent?.trim()) return;

  const tempId = `temp-${Date.now()}`;
  const userMessage = {
    _id: tempId,
    role: "user",
    content: messageContent,
    timestamp: new Date().toISOString(),
    isOptimistic: true,
  };

  setSelectedChat((prev) => ({
    ...prev,
    messages: [...(prev?.messages || []), userMessage],
  }));

  try {
    console.log("Sending message to:", `${import.meta.env.VITE_BASE_URL}/api/chat/${selectedChat._id}`);
    
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/chat/${selectedChat._id}`,
      {
        message: messageContent,
        // Don't need to send psychicId again since it's in the URL
      },
      {
        headers: { 
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
      }
    );

    console.log("Response:", res.data);

   if (res.data?.reply) {
  const aiMessage = {
    _id: `ai-${Date.now()}`,
    role: "assistant",
    content: res.data.reply,
    timestamp: new Date().toISOString(),
  };

  setPsychics(prevPsychics => {
    const alreadyExists = prevPsychics.some(p => p._id === selectedChat._id);
    if (alreadyExists) return prevPsychics;
    return [...prevPsychics, selectedChat];
  });

     setSelectedChat((prev) => ({
    ...prev,
    messages: [
      ...(prev?.messages?.filter((m) => m._id !== tempId) || []),
      { ...userMessage, isOptimistic: false },
      aiMessage,
    ],
  }));
}
  } catch (error) {
    console.error("Failed to send message:", error);
    console.error("Error details:", error.response?.data);

    // Remove optimistic message
    setSelectedChat((prev) => ({
      ...prev,
      messages: (prev?.messages || []).filter((m) => m._id !== tempId),
    }));

    // Show error message
    const errorMessage = {
      _id: `error-${Date.now()}`,
      role: "system",
      content: error.response?.data?.message || "Failed to send message. Please try again.",
      timestamp: new Date().toISOString(),
      isError: true,
    };

    setSelectedChat((prev) => ({
      ...prev,
      messages: [...(prev?.messages || []), errorMessage],
    }));
  }
};

  // JSX rendering
  if (isMobile) {
    return (
      <div className="h-screen w-full bg-background">
        {!showMobileChat ? (
          <ChatList
            psychics={psychics}
            onSelectPsychic={handlePsychicSelect}
            selectedPsychicId={selectedChat?._id}
            isLoading={isLoading}
          />
        ) : (
          <ChatDetail
            chat={selectedChat}
            onBack={handleBackToList}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w-7xl mx-auto px-2 border border-gray-200 mt-4 mb-10 overflow-hidden bg-background">
      <div className="w-1/3 border-r border-border">
        <ChatList
          psychics={psychics}
          onSelectPsychic={handlePsychicSelect}
          selectedPsychicId={selectedChat?._id}
          isLoading={isLoading}
        />
      </div>
      <div className="w-2/3">
        {selectedChat ? (
          <ChatDetail chat={selectedChat} onSendMessage={handleSendMessage} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : "Select a psychic to start messaging"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
