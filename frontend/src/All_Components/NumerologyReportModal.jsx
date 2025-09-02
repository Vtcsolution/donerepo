import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const NumerologyReportModal = ({ open, onClose, numerologyData }) => {
  if (!numerologyData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Your Free Numerology Report 🔮
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            <strong>Life Path Number:</strong> {numerologyData.lifePath} 🔢
          </p>
          <p>
            <strong>Soul Urge Number:</strong> {numerologyData.soulUrge} 💖
          </p>
          <p>
            <strong>Personality Number:</strong> {numerologyData.personality} 😊
          </p>
          <p>
            <strong>Expression Number:</strong> {numerologyData.expression} 🌟
          </p>
          {numerologyData.karmicLessons?.length > 0 && (
            <p>
              <strong>Karmic Lessons:</strong>{" "}
              {numerologyData.karmicLessons.join(", ")} 📝
            </p>
          )}
          {numerologyData.challenges?.length > 0 && (
            <p>
              <strong>Challenges:</strong>{" "}
              {numerologyData.challenges.join(", ")} ⚠️
            </p>
          )}
          <p className="text-sm text-gray-600">
            Want to dive deeper? Chat with Numara for a detailed reading — first
            minute free! 🎉
          </p>
        </div>
        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NumerologyReportModal;