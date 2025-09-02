import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/All_Components/screen/AuthContext";
import { toast } from "sonner";

export default function FeedbackModal({ open, onClose, psychicId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const { user } = useAuth();

  const handleSubmit = useCallback(async () => {
    if (!rating) {
      toast.error("Please provide a rating.");
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true); // Disable further submissions
    try {
      const token = localStorage.getItem("accessToken") || user?.token;
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/feedback/${psychicId}`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Feedback submitted successfully!", {
        id: "feedback-submit", // Unique ID to prevent duplicate toasts
      });
      onSubmit();
      onClose();
    } catch (error) {
      console.error("Feedback submission failed:", error);
      toast.error(`Failed to submit feedback: ${error.response?.data?.error || error.message}`, {
        id: "feedback-error", // Unique ID for error toast
      });
    } finally {
      setIsSubmitting(false); // Re-enable submission after completion
    }
  }, [rating, psychicId, user, onSubmit, onClose, isSubmitting]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Share Your Experience ✨
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Rating Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-center text-gray-600">
              How would you rate your session?
            </h3>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  disabled={isSubmitting} // Disable stars during submission
                >
                  <Star
                    className={`h-8 w-8 transition-all duration-150 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-500 fill-yellow-500 scale-110"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-2">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Great</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all"
            onClick={handleSubmit}
            disabled={!rating || isSubmitting} // Disable button during submission
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}