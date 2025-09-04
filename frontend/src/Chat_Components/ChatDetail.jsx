import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Smile, Timer, StopCircle, Check, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MessageBubble from "./Message_Bubble";
import { useAuth } from "@/All_Components/screen/AuthContext";
import FeedbackModal from "./FeedbackModal";
import axios from "axios";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

// Utility function to detect mobile devices
const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Utility function to throttle async operations
const throttle = (func, wait) => {
  let lastCall = 0;
  let isProcessing = false;
  return async (...args) => {
    const now = Date.now();
    if (now - lastCall < wait || isProcessing) return Promise.resolve();
    isProcessing = true;
    lastCall = now;
    try {
      return await func(...args);
    } finally {
      isProcessing = false;
    }
  };
};

// Utility function to debounce async operations (for non-mobile)
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
};

export default function ChatDetail({ chat, onBack, onSendMessage }) {
  const [messageInput, setMessageInput] = useState("");
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isStoppingSession, setIsStoppingSession] = useState(false);
  const [credits, setCredits] = useState(null);
  const [isFreePeriod, setIsFreePeriod] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [error, setError] = useState(null);
  const [freeSessionStarted, setFreeSessionStarted] = useState(false);
  const [freeSessionUsed, setFreeSessionUsed] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activePaidSession, setActivePaidSession] = useState(null);
  const { user, loading: authLoading, error: authError } = useAuth();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const modalDebounceRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const timerIntervalRef = useRef(null);
  const sessionLockRef = useRef(false); // Lock to prevent concurrent start/stop

  // Format timer duration in MM:SS
  const formatTimerDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Debounce modal state changes
  const setModalState = (key, value) => {
    if (modalDebounceRef.current) clearTimeout(modalDebounceRef.current);
    modalDebounceRef.current = setTimeout(() => {
      if (key === "showFeedbackModal") setShowFeedbackModal(value);
    }, 500);
  };

  // Handle click/touch outside to close emoji picker
  useEffect(() => {
    const handleOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  // Fetch session status with retry logic
  const fetchSessionStatus = async (retries = 3, delay = 1500) => {
    if (!chat?._id || authLoading || !user || authError || sessionLockRef.current) return;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const token = localStorage.getItem("accessToken") || user.token;
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/session-status/${chat._id}`,
          { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
        );
        const { isFree, remainingFreeTime, paidTimer, credits: serverCredits, status, freeSessionUsed } = response.data;
        setIsFreePeriod(isFree);
        setCredits(serverCredits ?? 0); // Default to 0 if credits is undefined
        setTimerDuration(isFree ? remainingFreeTime : paidTimer);
        setTimerActive(isFree || (status === "paid" && paidTimer > 0));
        setFreeSessionStarted(isFree || status !== "new");
        setFreeSessionUsed(freeSessionUsed);
        if (status === "paid") {
          setActivePaidSession({ psychicId: chat._id, paidTimer });
        } else {
          setActivePaidSession(null);
        }
        setError(null);
        return;
      } catch (error) {
        if (attempt === retries) {
          setCredits(0); // Fallback to 0 to show "Add Credits" button
          setTimerActive(false);
          setTimerDuration(0);
        } else {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  };

  // Initialize WebSocket and handle session updates
  useEffect(() => {
    if (!user || !chat?._id) return;

    socketRef.current = io(import.meta.env.VITE_BASE_URL, { withCredentials: true });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", user._id);
    });

    socketRef.current.on("sessionUpdate", (data) => {
      if (sessionLockRef.current) return; // Ignore updates during start/stop
      if (data.psychicId === chat._id) {
        console.log("Received sessionUpdate:", data); // Debug log
        setIsFreePeriod(data.isFree);
        setTimerActive(data.isFree || (data.status === "paid" && data.paidTimer > 0));
        setFreeSessionStarted(data.isFree || data.status !== "new");
        setFreeSessionUsed(data.freeSessionUsed || false);
        setTimerDuration(data.isFree ? data.remainingFreeTime : data.paidTimer);
        setCredits(data.credits ?? 0); // Default to 0 if credits is undefined
        if (data.status === "paid" && data.paidTimer > 0) {
          setActivePaidSession({ psychicId: data.psychicId, paidTimer: data.paidTimer });
        } else if (data.status === "stopped" || data.status === "insufficient_credits") {
          setActivePaidSession(null);
          setTimerActive(false);
          setTimerDuration(0);
          if (data.showFeedbackModal) setModalState("showFeedbackModal", true);
        }
      } else {
        if (data.status === "paid" && data.paidTimer > 0) {
          setActivePaidSession({ psychicId: data.psychicId, paidTimer: data.paidTimer });
        } else if (data.status === "stopped" && activePaidSession?.psychicId === data.psychicId) {
          setActivePaidSession(null);
        }
      }
    });

    socketRef.current.on("creditsUpdate", (data) => {
      if (data.userId === user._id) {
        setCredits(data.credits ?? 0); // Default to 0 if credits is undefined
      }
    });

    socketRef.current.on("connect_error", (err) => {
      setError("Failed to connect to real-time updates. Falling back to polling.");
      const pollingInterval = setInterval(() => fetchSessionStatus(), 2000);
      socketRef.current.pollingInterval = pollingInterval;
    });

    fetchSessionStatus();

    return () => {
      if (socketRef.current) {
        clearInterval(socketRef.current.pollingInterval);
        socketRef.current.disconnect();
      }
    };
  }, [user, chat?._id]);

  // Auto-start free session if not started or used
  useEffect(() => {
    if (chat?._id && user && !authLoading && !authError && !freeSessionStarted && !freeSessionUsed) {
      startFreeSession();
    }
  }, [chat?._id, user, authLoading, authError, freeSessionStarted, freeSessionUsed]);

  // Start free session
  const startFreeSession = async () => {
    if (!chat?._id || authLoading || !user || authError || freeSessionStarted || freeSessionUsed || sessionLockRef.current) return;
    sessionLockRef.current = true;
    try {
      const token = localStorage.getItem("accessToken") || user.token;
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/start-free-session/${chat._id}`,
        {},
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFreePeriod(response.data.isFree);
      setTimerDuration(response.data.remainingFreeTime);
      setTimerActive(response.data.isFree);
      setCredits(response.data.credits ?? 0); // Default to 0 if undefined
      setFreeSessionStarted(true);
      setFreeSessionUsed(response.data.freeSessionUsed);
      setError(null);
      await fetchSessionStatus();
    } catch (error) {
      if (error.response?.data?.error === "Free minute already used") {
        setFreeSessionUsed(true);
        setIsFreePeriod(false);
        setTimerActive(false);
        setTimerDuration(0);
        await fetchSessionStatus();
      } else {
        setError(`Failed to start free session: ${error.response?.data?.error || error.message}`);
        toast.error(error.response?.data?.error || "Failed to start free session.");
      }
    } finally {
      sessionLockRef.current = false;
    }
  };

  // Start paid session
  const startPaidSessionHandler = isMobileDevice()
    ? throttle(async () => {
        if (credits === null || credits <= 0 || isStartingSession || sessionLockRef.current) {
          setIsPaymentModalOpen(true);
          return;
        }
        sessionLockRef.current = true;
        setIsStartingSession(true);
        try {
          const token = localStorage.getItem("accessToken") || user.token;
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/start-paid-session/${chat._id}`,
            {},
            { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
          );
          setIsFreePeriod(false);
          setTimerDuration(response.data.paidTimer);
          setTimerActive(true);
          setCredits(response.data.credits ?? 0); // Default to 0 if undefined
          setFreeSessionUsed(true);
          setActivePaidSession({ psychicId: chat._id, paidTimer: response.data.paidTimer });
          setError(null);
          toast.success("Paid session started successfully!");
        } catch (error) {
          const errMsg = error.response?.data?.error || error.message;
          setError(`Failed to start paid session: ${errMsg}`);
          toast.error(errMsg || "Failed to start paid session. Please try again.");
          if (errMsg.includes("locked")) {
            toast.info("Resources are temporarily locked. Retrying automatically.");
          }
        } finally {
          setIsStartingSession(false);
          sessionLockRef.current = false;
        }
      }, 2000)
    : debounce(async () => {
        if (credits === null || credits <= 0 || isStartingSession || sessionLockRef.current) {
          setIsPaymentModalOpen(true);
          return;
        }
        sessionLockRef.current = true;
        setIsStartingSession(true);
        try {
          const token = localStorage.getItem("accessToken") || user.token;
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/start-paid-session/${chat._id}`,
            {},
            { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
          );
          setIsFreePeriod(false);
          setTimerDuration(response.data.paidTimer);
          setTimerActive(true);
          setCredits(response.data.credits ?? 0); // Default to 0 if undefined
          setFreeSessionUsed(true);
          setActivePaidSession({ psychicId: chat._id, paidTimer: response.data.paidTimer });
          setError(null);
          toast.success("Paid session started successfully!");
        } catch (error) {
          const errMsg = error.response?.data?.error || error.message;
          setError(`Failed to start paid session: ${errMsg}`);
          toast.error(errMsg || "Failed to start paid session. Please try again.");
          if (errMsg.includes("locked")) {
            toast.info("Resources are temporarily locked. Retrying automatically.");
          }
        } finally {
          setIsStartingSession(false);
          sessionLockRef.current = false;
        }
      }, 500);

  // Stop paid session
  const stopPaidSessionHandler = isMobileDevice()
    ? throttle(async () => {
        if (!chat?._id || authLoading || !user || authError || isStoppingSession || isStartingSession || sessionLockRef.current) return;
        sessionLockRef.current = true;
        setIsStoppingSession(true);
        try {
          const token = localStorage.getItem("accessToken") || user.token;
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/stop-session/${chat._id}`,
            {},
            { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
          );
          setIsFreePeriod(false);
          setTimerActive(false);
          setTimerDuration(0);
          setActivePaidSession(null);
          setCredits(response.data.credits ?? 0); // Default to 0 if undefined
          setFreeSessionUsed(true);
          setModalState("showFeedbackModal", true);
          setError(null);
          toast.success("Paid session stopped successfully!");
        } catch (error) {
          const errMsg = error.response?.data?.error || error.message;
          setError(`Failed to stop session: ${errMsg}`);
          toast.error(errMsg || "Failed to stop session. Please try again.");
          if (errMsg.includes("locked")) {
            toast.info("Session or wallet is locked. Please try again shortly.");
          }
        } finally {
          setIsStoppingSession(false);
          sessionLockRef.current = false;
        }
      }, 2000)
    : debounce(async () => {
        if (!chat?._id || authLoading || !user || authError || isStoppingSession || isStartingSession || sessionLockRef.current) return;
        sessionLockRef.current = true;
        setIsStoppingSession(true);
        try {
          const token = localStorage.getItem("accessToken") || user.token;
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/stop-session/${chat._id}`,
            {},
            { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
          );
          setIsFreePeriod(false);
          setTimerActive(false);
          setTimerDuration(0);
          setActivePaidSession(null);
          setCredits(response.data.credits ?? 0); // Default to 0 if undefined
          setFreeSessionUsed(true);
          setModalState("showFeedbackModal", true);
          setError(null);
          toast.success("Paid session stopped successfully!");
        } catch (error) {
          const errMsg = error.response?.data?.error || error.message;
          setError(`Failed to stop session: ${errMsg}`);
          toast.error(errMsg || "Failed to stop session. Please try again.");
          if (errMsg.includes("locked")) {
            toast.info("Session or wallet is locked. Please try again shortly.");
          }
        } finally {
          setIsStoppingSession(false);
          sessionLockRef.current = false;
        }
      }, 500);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Initialize session on mount
  useEffect(() => {
    if (chat?._id && user && !authLoading && !authError) {
      if (activePaidSession && activePaidSession.psychicId !== chat._id) {
        setTimerActive(false);
        setTimerDuration(0);
        setIsFreePeriod(false);
        setError("End your current paid session to chat with this psychic.");
      } else {
        fetchSessionStatus();
      }
    } else {
      setError(authError || "Missing psychic ID or user authentication");
      setCredits(0); // Default to 0 to ensure "Add Credits" button shows on auth error
    }
  }, [chat?._id, user, authLoading, authError, activePaidSession]);

  // Local timer countdown for smoothness
  useEffect(() => {
    if (timerActive && timerDuration > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerDuration((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [timerActive, timerDuration]);

  // Handle emoji selection
  const handleEmojiClick = (emojiObject) => {
    setMessageInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending || authLoading || !chat?._id || authError) {
      toast.error("Cannot send message. Please check your session or authentication.");
      return;
    }

    if (activePaidSession && activePaidSession.psychicId !== chat._id) {
      toast.error("End your current paid session to chat with this psychic.");
      return;
    }

    if (!timerActive) {
      if (freeSessionUsed && (credits == null || credits <= 0)) {
        toast.error("Out of credits. Please buy more to start a paid session.");
        setIsPaymentModalOpen(true); // Open payment modal when trying to send message with 0 credits
        return;
      }
      if (freeSessionUsed && credits > 0) {
        toast.error("Start a paid session to continue chatting.");
        return;
      }
      toast.error("Session not active. Please start a session.");
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem("accessToken") || user.token;
      await onSendMessage(messageInput, token);
      setMessageInput("");
      setError(null);
    } catch (error) {
      setError(`Failed to send message: ${error.response?.data?.error || error.message}`);
      toast.error(error.response?.data?.error || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key for sending message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle touch events for buttons
  const handleTouchStart = (e, handler) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    handler();
  };

  // Determine input placeholder
  const getInputPlaceholder = () => {
    if (!chat?._id || authLoading || authError) return "Loading...";
    if (activePaidSession && activePaidSession.psychicId !== chat._id) {
      return "End your current paid session to chat with this psychic";
    }
    if (timerActive) {
      return isFreePeriod ? "Type a message (free session)..." : "Type a message (paid session)...";
    }
    if (freeSessionUsed) {
      return (credits == null || credits <= 0) ? "Purchase credits to continue chatting." : "Start a paid session to chat";
    }
    return "Type a message...";
  };

  // Handle payment
  const handlePayment = async () => {
    if (!selectedPaymentMethod || !selectedPlan) {
      toast.error("Please select a payment method and plan.");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/payments/topup`,
        {
          amount: selectedPlan.price,
          planName: selectedPlan.name,
          creditsPurchased: selectedPlan.credits,
          paymentMethod: selectedPaymentMethod,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("lastPaymentId", response.data.paymentId);
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-[#EEEEEE] p-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        {chat?._id ? (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={chat?.image || "/placeholder.svg"} alt={chat?.name} />
              <AvatarFallback>{chat?.name?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-medium">{chat?.name}</h2>
                <span className="text-xs text-muted-foreground">{chat?.type} Specialist</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1">
            <span className="text-sm text-muted-foreground">Loading psychic data...</span>
          </div>
        )}
        {(error || authError) && (
          <span className="text-xs text-red-500">{error || authError}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {(chat?.messages || []).map((message) => (
            <MessageBubble
              key={message._id || message.id}
              message={message}
              isMe={message.role === "user"}
              isLoading={message.isLoading}
            />
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-lg bg-muted px-4 py-2">
                <div className="flex space-x-1">
                  <p className="text-muted-foreground">Typing</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Timer, Credits, and Session Control Buttons */}
      {chat?._id && !authError && (
        <div className="border-t border-border bg-[#EEEEEE] p-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Timer on the Left */}
            {isMobileDevice() ? (
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4 text-[#3B5EB7]" />
                <span className="text-sm font-medium">
                  {timerActive
                    ? isFreePeriod
                      ? `Free Session: ${formatTimerDuration(timerDuration)}`
                      : `Paid Session: ${formatTimerDuration(timerDuration)}`
                    : activePaidSession && activePaidSession.psychicId !== chat._id
                    ? `Paid session active with another psychic`
                    : freeSessionUsed
                    ? "Free minute used"
                    : "Waiting to start free minute"}
                </span>
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4 text-[#3B5EB7]" />
                      <span className="text-sm font-medium">
                        {timerActive
                          ? isFreePeriod
                            ? `Free Session: ${formatTimerDuration(timerDuration)}`
                            : `Paid Session: ${formatTimerDuration(timerDuration)}`
                          : activePaidSession && activePaidSession.psychicId !== chat._id
                          ? `Paid session active with another psychic`
                          : freeSessionUsed
                          ? "Free minute used"
                          : "Waiting to start free minute"}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFreePeriod
                      ? "Free minute timer (1 minute, cannot be stopped)"
                      : timerActive
                      ? `Paid session: ${credits ?? 0} credits remaining`
                      : activePaidSession && activePaidSession.psychicId !== chat._id
                      ? `End your paid session with another psychic to chat`
                      : freeSessionUsed
                      ? "Free minute used, start a paid session"
                      : "Free minute will start automatically"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Credits and Session Buttons on the Right */}
            <div className="flex items-center gap-2 flex-wrap">
              {credits !== null && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#3B5EB7] text-white hover:bg-[#2A4A9A] hover:text-white transition-colors"
                  disabled
                >
                  Credits: {credits}
                </Button>
              )}
              {!isFreePeriod && !timerActive && (credits === null || credits <= 0) && freeSessionUsed && (
                isMobileDevice() ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleTouchStart(e, () => setIsPaymentModalOpen(true))}
                    onTouchStart={(e) => handleTouchStart(e, () => setIsPaymentModalOpen(true))}
                    disabled={isStartingSession || isStoppingSession || sessionLockRef.current}
                    className="gap-1 bg-[#3B5EB7] text-white hover:bg-[#2A4A9A] hover:text-white transition-colors active:opacity-70"
                  >
                    Add Credits
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPaymentModalOpen(true)}
                          disabled={isStartingSession || isStoppingSession || sessionLockRef.current}
                          className="gap-1 bg-[#3B5EB7] text-white hover:bg-[#2A4A9A] hover:text-white transition-colors"
                        >
                          Add Credits
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Purchase credits to continue
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              )}
              {!isFreePeriod && !timerActive && credits !== null && credits > 0 && freeSessionUsed && (
                isMobileDevice() ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleTouchStart(e, startPaidSessionHandler)}
                    onTouchStart={(e) => handleTouchStart(e, startPaidSessionHandler)}
                    disabled={credits === null || authLoading || authError || !user || isStartingSession || sessionLockRef.current}
                    className="gap-1 bg-[#3B5EB7] text-white hover:bg-[#2A4A9A] hover:text-white transition-colors active:opacity-70"
                  >
                    {isStartingSession ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Starting...
                      </div>
                    ) : (
                      "Start Paid Session"
                    )}
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startPaidSessionHandler}
                          disabled={credits === null || authLoading || authError || !user || isStartingSession || sessionLockRef.current}
                          className="gap-1 bg-[#3B5EB7] text-white hover:bg-[#2A4A9A] hover:text-white transition-colors"
                        >
                          {isStartingSession ? (
                            <div className="flex items-center gap-1">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Starting...
                            </div>
                          ) : (
                            "Start Paid Session"
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Start paid session (1 credit/min)
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              )}
              {timerActive && !isFreePeriod && (
                isMobileDevice() ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleTouchStart(e, stopPaidSessionHandler)}
                    onTouchStart={(e) => handleTouchStart(e, stopPaidSessionHandler)}
                    disabled={authLoading || authError || !user || isStoppingSession || isStartingSession || sessionLockRef.current}
                    className="gap-1 bg-[#3B5EB7] text-white hover:bg-[#2A4A9A] hover:text-white transition-colors active:opacity-70"
                  >
                    {isStoppingSession ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Stopping...
                      </div>
                    ) : (
                      <>
                        <StopCircle className="h-4 w-4" />
                        Stop Paid Session
                      </>
                    )}
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={stopPaidSessionHandler}
                          disabled={authLoading || authError || !user || isStoppingSession || isStartingSession || sessionLockRef.current}
                          className="gap-1 bg-[#3B5EB7] text-white hover:bg-[#2A4A9A] hover:text-white transition-colors"
                        >
                          {isStoppingSession ? (
                            <div className="flex items-center gap-1">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Stopping...
                            </div>
                          ) : (
                            <>
                              <StopCircle className="h-4 w-4" />
                              Stop Paid Session
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Stop paid session
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              )}
              {activePaidSession && activePaidSession.psychicId !== chat._id && (
                <span className="text-xs text-red-500">Active session with another psychic</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getInputPlaceholder()}
              className="pr-12"
              disabled={isSending || !chat?._id || authLoading || authError || (activePaidSession && activePaidSession.psychicId !== chat._id) || (!timerActive && freeSessionUsed && (credits == null || credits <= 0))}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              aria-label="Toggle emoji picker"
              disabled={isSending || !chat?._id || authLoading || authError || (activePaidSession && activePaidSession.psychicId !== chat._id) || (!timerActive && freeSessionUsed && (credits == null || credits <= 0))}
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-12 left-0 right-0 mx-auto w-[90%] max-w-md z-20 shadow-lg">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width="100%"
                  height={400}
                  emojiStyle="native"
                  autoFocusSearch={false}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled={true}
                  categories={[
                    "smileys_people",
                    "animals_nature",
                    "food_drink",
                    "activities",
                    "travel_places",
                    "objects",
                    "symbols",
                    "flags",
                  ]}
                />
              </div>
            )}
          </div>
          <Button
            variant="brand"
            onClick={handleSendMessage}
            onTouchStart={(e) => handleTouchStart(e, handleSendMessage)}
            disabled={!messageInput.trim() || isSending || !chat?._id || authLoading || authError || (activePaidSession && activePaidSession.psychicId !== chat._id) || (!timerActive && freeSessionUsed && (credits == null || credits <= 0))}
            size="icon"
            aria-label="Send message"
            className="active:opacity-70"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <FeedbackModal
        open={showFeedbackModal}
        onClose={() => setModalState("showFeedbackModal", false)}
        psychicId={chat?._id}
        onSubmit={() => {
          console.log("Feedback submitted in ChatDetail");
        }}
      />

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[400px] max-h-[80vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Buy Chat Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium text-center">
                Choose a credit package
              </h3>
              <div className="grid gap-3">
                {[
                  {
                    name: "Starter Plan",
                    credits: 10,
                    price: 6.99,
                    pricePerMinute: 0.70,
                  },
                  {
                    name: "Popular Plan",
                    credits: 20,
                    price: 11.99,
                    pricePerMinute: 0.60,
                    isPopular: true,
                  },
                  {
                    name: "Deep Dive Plan",
                    credits: 30,
                    price: 16.99,
                    pricePerMinute: 0.57,
                  },
                ].map((plan) => (
                  <motion.div
                    key={plan.name}
                    className={`border rounded-lg p-3 cursor-pointer transition-all relative ${
                      selectedPlan?.name === plan.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                    onTouchStart={() => setSelectedPlan(plan)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-bl-md rounded-tr-md">
                        POPULAR
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-base">{plan.name}</h4>
                        <p className="text-sm text-gray-500">
                          {plan.credits} credits ({plan.credits} minutes)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base">€{plan.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          €{plan.pricePerMinute.toFixed(2)}/min
                        </p>
                      </div>
                    </div>
                    {selectedPlan?.name === plan.name && (
                      <div className="mt-1 text-right">
                        <Check className="w-5 h-5 text-blue-500 inline" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-medium text-center">
                Select Payment Method
              </h3>
              <div className="space-y-1">
                {[
                  { id: "ideal", name: "iDEAL", icon: "https://www.mollie.com/external/icons/payment-methods/ideal.png" },
                  { id: "creditcard", name: "Credit Card", icon: "https://www.mollie.com/external/icons/payment-methods/creditcard.png" },
                  { id: "bancontact", name: "Bancontact", icon: "https://www.mollie.com/external/icons/payment-methods/bancontact.png" },
                ].map((method) => (
                  <motion.button
                    key={method.id}
                    className={`w-full flex justify-between items-center py-2 px-3 border rounded-md text-base ${
                      selectedPaymentMethod === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    onTouchStart={() => setSelectedPaymentMethod(method.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-2">
                      <img src={method.icon} alt={method.name} className="h-5" />
                      <span className="font-medium">{method.name}</span>
                    </div>
                    {selectedPaymentMethod === method.id && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            <motion.button
              className="w-full bg-[#3B5EB7] hover:bg-[#2d4a9b] text-white text-base font-medium py-2 rounded-md active:opacity-70"
              disabled={!selectedPaymentMethod || !selectedPlan || isProcessing || sessionLockRef.current}
              onClick={handlePayment}
              onTouchStart={(e) => handleTouchStart(e, handlePayment)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                `Pay €${selectedPlan?.price?.toFixed(2) || "0.00"}`
              )}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
