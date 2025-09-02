
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
      <DialogContent className="max-w-[90vw] sm:max-w-[400px] max-h-[80vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-lg">Buy Chat Credits</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-center">Choose a credit package</h3>
            <div className="grid gap-3">
              <motion.div
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  amount === 6.99 ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() =>
                  handlePresetAmount(6.99, {
                    name: "Starter Plan",
                    credits: 10,
                    price: 6.99,
                    pricePerMinute: 0.7,
                  })
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-base">Starter Plan</h4>
                    <p className="text-sm text-gray-500">10 credits (10 minutes)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">€6.99</p>
                    <p className="text-xs text-gray-500">€0.70/min</p>
                  </div>
                </div>
                {amount === 6.99 && (
                  <div className="mt-1 text-right">
                    <Check className="w-5 h-5 text-blue-500 inline" />
                  </div>
                )}
              </motion.div>
              <motion.div
                className={`border rounded-lg p-3 cursor-pointer transition-all relative ${
                  amount === 11.99 ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() =>
                  handlePresetAmount(11.99, {
                    name: "Popular Plan",
                    credits: 20,
                    price: 11.99,
                    pricePerMinute: 0.6,
                  })
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-bl-md rounded-tr-md">
                  POPULAR
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-base">Popular Plan</h4>
                    <p className="text-sm text-gray-500">20 credits (20 minutes)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">€11.99</p>
                    <p className="text-xs text-gray-500">€0.60/min</p>
                  </div>
                </div>
                {amount === 11.99 && (
                  <div className="mt-1 text-right">
                    <Check className="w-5 h-5 text-blue-500 inline" />
                  </div>
                )}
              </motion.div>
              <motion.div
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  amount === 16.99 ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() =>
                  handlePresetAmount(16.99, {
                    name: "Deep Dive Plan",
                    credits: 30,
                    price: 16.99,
                    pricePerMinute: 0.57,
                  })
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-base">Deep Dive Plan</h4>
                    <p className="text-sm text-gray-500">30 credits (30 minutes)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">€16.99</p>
                    <p className="text-xs text-gray-500">€0.57/min</p>
                  </div>
                </div>
                {amount === 16.99 && (
                  <div className="mt-1 text-right">
                    <Check className="w-5 h-5 text-blue-500 inline" />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-medium text-center">Select Payment Method</h3>
            <div className="space-y-1">
              <motion.button
                className={`w-full flex justify-between items-center py-2 px-3 border rounded-md text-base ${
                  selectedPaymentMethod === "ideal" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() => handlePaymentMethodSelect("ideal")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src="https://www.mollie.com/external/icons/payment-methods/ideal.png"
                    alt="iDEAL"
                    className="h-5"
                  />
                  <span className="font-medium">iDEAL</span>
                </div>
                {selectedPaymentMethod === "ideal" && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </motion.button>
              <motion.button
                className={`w-full flex justify-between items-center py-2 px-3 border rounded-md text-base ${
                  selectedPaymentMethod === "creditcard" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() => handlePaymentMethodSelect("creditcard")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src="https://www.mollie.com/external/icons/payment-methods/creditcard.png"
                    alt="Credit Card"
                    className="h-5"
                  />
                  <span className="font-medium">Credit Card</span>
                </div>
                {selectedPaymentMethod === "creditcard" && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </motion.button>
              <motion.button
                className={`w-full flex justify-between items-center py-2 px-3 border rounded-md text-base ${
                  selectedPaymentMethod === "bancontact" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() => handlePaymentMethodSelect("bancontact")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src="https://www.mollie.com/external/icons/payment-methods/bancontact.png"
                    alt="Bancontact"
                    className="h-5"
                  />
                  <span className="font-medium">Bancontact</span>
                </div>
                {selectedPaymentMethod === "bancontact" && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </motion.button>
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
                Processing...
              </div>
            ) : (
              `Pay €${amount.toFixed(2)}`
            )}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
