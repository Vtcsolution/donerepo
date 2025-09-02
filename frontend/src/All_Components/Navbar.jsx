import {
  AlignJustify,
  Wallet,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./screen/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";

export default function Navbar({ onOpenPaymentModal }) {
  const [menubar, setMenubar] = useState(false);
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePaymentMethodSelect = useCallback((method) => {
    setSelectedPaymentMethod(method);
  }, []);

  const openPaymentModal = useCallback(() => {
    setIsPaymentModalOpen(true);
  }, []);

  useEffect(() => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal(openPaymentModal);
    }
  }, [onOpenPaymentModal, openPaymentModal]);

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoadingBalance(false);
      return;
    }

    // Initialize Socket.IO connection
    const newSocket = io(import.meta.env.VITE_BASE_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Handle connection
    newSocket.on("connect", () => {
      console.log("Socket.IO connected, joining room:", user._id);
      newSocket.emit("join", user._id);
    });

    // Listen for walletUpdate event
    newSocket.on("walletUpdate", (data) => {
      console.log("Received walletUpdate:", data);
      setWalletBalance(data.credits || 0);
      setIsLoadingBalance(false);
    });

    // Handle connection errors
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection issue. Please check your network.");
      setIsLoadingBalance(false);
    });

    // Fetch initial wallet balance
    const fetchWalletBalance = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          toast.error("Please log in again to access your credits.");
          navigate("/login");
          return;
        }
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/wallet/balance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched wallet balance:", response.data);
        setWalletBalance(response.data.credits || 0);
        setIsLoadingBalance(false);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setWalletBalance(0);
        setIsLoadingBalance(false);
      }
    };

    fetchWalletBalance();

    // Polling every 30 seconds as a fallback
    const pollingInterval = setInterval(fetchWalletBalance, 30000);

    // Cleanup on unmount
    return () => {
      console.log("Disconnecting Socket.IO and clearing polling");
      newSocket.disconnect();
      setSocket(null);
      clearInterval(pollingInterval);
    };
  }, [user, authLoading, navigate]);

  const handleMenu = useCallback(() => {
    setMenubar((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    toast.success("Logout successful");
    navigate("/");
  }, [logout, navigate]);

  const handlePayment = useCallback(async () => {
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
  }, [selectedPaymentMethod, selectedPlan]);

  // Animation variants for menu items
  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  // Animation for credit balance
  const balanceVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <div
        className={`w-full lg:hidden duration-300 transition-all ${
          menubar ? "left-0" : "left-[-100%]"
        } absolute top-[95px] z-50`}
      >
        <motion.ul
          className="w-full flex flex-col gap-4 bg-[#EEEEEE] py-4 px-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >

        <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/">
              <span className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer text-lg font-medium">
                Home
              </span>
            </Link>
          </motion.li>
          <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/about">
              <span className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer text-lg font-medium">
                About
              </span>
            </Link>
          </motion.li>
          <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/contact">
              <span className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer text-lg font-medium">
                Contact
              </span>
            </Link>
          </motion.li>
          <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/terms-&-conditions">
              <span className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer text-lg font-medium">
                Terms & Conditions
              </span>
            </Link>
          </motion.li>
          {user && (
            <motion.li variants={menuItemVariants}>
              <Link
                onClick={handleMenu}
                to="/dashboard"
                className="inline-block bg-blue-100 hover:bg-blue-200 text-[#3B5EB7] hover:text-[#2d4a9b] cursor-pointer text-lg font-medium px-3 py-1 rounded-md transition-colors duration-200"
              >
                Dashboard
              </Link>
            </motion.li>
          )}
          {!user && (
            <motion.div variants={menuItemVariants} className="flex items-center gap-4">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="text-sm w-full bg-white hover:bg-[#3B5EB7] hover:text-white transition-colors duration-300 px-6 py-2"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  className="text-sm w-full bg-white hover:bg-[#3B5EB7] hover:text-white transition-colors duration-300 px-6 py-2"
                >
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          )}
          {user && (
            <motion.li variants={menuItemVariants}>
              <p
                className="inline-block bg-blue-100 hover:bg-blue-200 text-[#3B5EB7] hover:text-[#2d4a9b] cursor-pointer text-lg font-medium px-3 py-1 rounded-md transition-colors duration-200"
                onClick={handleLogout}
              >
                Logout
              </p>
            </motion.li>
          )}
        </motion.ul>
      </div>
      <header className="overflow-hidden border-b top-0 bg-[#EEEEEE] z-[100] shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Link to="/">
                <motion.img
                  src="/images/newLogo.jpg"
                  alt="logo"
                  className="h-16 w-16 rounded-full object-cover"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <motion.ul
                className="flex max-lg:hidden items-center gap-6"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              >

                <motion.li variants={menuItemVariants}>
            <Link onClick={handleMenu} to="/">
              <span className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer text-lg font-medium">
                Home
              </span>
            </Link>
          </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/about">
                    <span className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer text-lg font-medium">
                      About
                    </span>
                  </Link>
                </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/contact">
                    <span className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer text-lg font-medium">
                      Contact
                    </span>
                  </Link>
                </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/terms-&-conditions">
                    <span className="text-[#3B5EB7] hover:text-[#88a7f5] cursor-pointer text-lg font-medium">
                      Terms & Conditions
                    </span>
                  </Link>
                </motion.li>
                {user && (
                  <motion.li variants={menuItemVariants}>
                    <Link
                      to="/dashboard"
                      className="inline-block bg-blue-100 hover:bg-blue-200 text-[#3B5EB7] hover:text-[#2d4a9b] cursor-pointer text-lg font-medium px-3 py-1 rounded-md transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                  </motion.li>
                )}
                {!user && (
                  <motion.div variants={menuItemVariants} className="flex items-center gap-4">
                    <Link to="/login">
                      <Button
                        variant="outline"
                        className="text-sm bg-white hover:bg-[#3B5EB7] hover:text-white transition-colors duration-300 px-6 py-2"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button
                        variant="outline"
                        className="text-sm bg-white hover:bg-[#3B5EB7] hover:text-white transition-colors duration-300 px-6 py-2"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                )}
                {user && (
                  <motion.li variants={menuItemVariants}>
                    <p
                      className="inline-block bg-blue-100 hover:bg-blue-200 text-[#3B5EB7] hover:text-[#2d4a9b] cursor-pointer text-lg font-medium px-3 py-1 rounded-md transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      Logout
                    </p>
                  </motion.li>
                )}
              </motion.ul>
              <div className="lg:hidden z-[50]">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <AlignJustify onClick={handleMenu} className="cursor-pointer" />
                </motion.div>
              </div>
              {user && (
                <div className="flex items-center gap-4">
                  <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogTrigger asChild>
                      <motion.div
                        className="inline-block bg-[#3B5EB7] hover:bg-[#2d4a9b] text-white text-sm font-medium px-2 py-1 rounded-md transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Wallet className="h-5 w-5" />
                        {authLoading || isLoadingBalance ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <motion.span
                            key={walletBalance}
                            variants={balanceVariants}
                            initial="initial"
                            animate="animate"
                          >
                            Credits: {walletBalance.toFixed(2)}
                          </motion.span>
                        )}
                      </motion.div>
                    </DialogTrigger>
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
                                onClick={() => handlePaymentMethodSelect(method.id)}
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
                          className="w-full bg-[#3B5EB7] hover:bg-[#2d4a9b] text-white text-base font-medium py-2 rounded-md"
                          disabled={!selectedPaymentMethod || !selectedPlan || isProcessing}
                          onClick={handlePayment}
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
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}