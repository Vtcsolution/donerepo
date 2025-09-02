// components/PaymentModal.jsx
import { usePaymentModal } from "@/context/PaymentModalContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export default function PaymentModal() {
  const {
    isOpen,
    closeModal,
    selectedPlan,
    setSelectedPlan,
    amount,
    setAmount,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    handlePayment,
    isProcessing,
  } = usePaymentModal();

  const handlePresetAmount = (value, plan) => {
    setAmount(value);
    setSelectedPlan(plan);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buy Chat Credits</DialogTitle>
        </DialogHeader>
        {/* Keep the rest of your payment UI here as you already have in Navbar */}
        {/* Replace all local states with context values */}
        {/* ... */}
        <motion.button
          className="w-full bg-[#3B5EB7] hover:bg-[#2d4a9b] text-white font-medium py-2 rounded-md"
          disabled={!selectedPaymentMethod || !selectedPlan || isProcessing}
          onClick={handlePayment}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : (
            `Pay €${amount.toFixed(2)}`
          )}
        </motion.button>
      </DialogContent>
    </Dialog>
  );
}
