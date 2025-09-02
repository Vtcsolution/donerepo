import { createContext, useState, useContext } from 'react';
import axios from 'axios'; // If needed for handlePayment
import { toast } from 'sonner'; // If needed for notifications
import { useNavigate } from 'react-router-dom'; // If needed for navigation

const PaymentModalContext = createContext();

export function PaymentModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate(); // Optional, if navigation is needed

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setSelectedPlan(null);
    setAmount(0);
    setSelectedPaymentMethod(null);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !selectedPlan) return;
    setIsProcessing(true);
    try {
      // Example payment logic with Mollie or your API
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/create-payment`,
        {
          amount: amount * 100, // Convert to cents if needed
          description: `${selectedPlan.credits} Credits - ${selectedPlan.name}`,
          method: selectedPaymentMethod,
        },
        { withCredentials: true }
      );
      const { url, id } = response.data;
      localStorage.setItem('lastPaymentId', id);
      window.location.href = url; // Redirect to payment gateway
    } catch (error) {
      toast.error('Payment initiation failed. Please try again.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PaymentModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        selectedPlan,
        setSelectedPlan,
        amount,
        setAmount,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        handlePayment,
        isProcessing,
      }}
    >
      {children}
    </PaymentModalContext.Provider>
  );
}

export const usePaymentModal = () => {
  const context = useContext(PaymentModalContext);
  if (context === undefined) {
    throw new Error('usePaymentModal must be used within a PaymentModalProvider');
  }
  return context;
};