import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Heart, User, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/All_Components/screen/AuthContext";
import axios from "axios";

const NumerologyReport = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(location.state?.numerologyReport || null);
  const [showModal, setShowModal] = useState(!!location.state?.numerologyReport);
  const [firstPsychicId, setFirstPsychicId] = useState(null);

  // Fetch first Tarot psychic
  useEffect(() => {
    const fetchFirstTarotPsychic = async () => {
      try {
        if (!user?._id) return; // Wait for user auth
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/psychics/type/Tarot`,
          { withCredentials: true }
        );
        const psychics = res.data?.data || [];
        if (psychics.length > 0) {
          setFirstPsychicId(psychics[0]._id);
        } else {
          toast.error("Geen Tarot psychics gevonden.");
        }
      } catch (err) {
        console.error("❌ Mislukt om Tarot psychics op te halen:", err.response?.data || err.message);
        toast.error("Mislukt om Tarot psychic data te laden.");
      }
    };

    fetchFirstTarotPsychic();
  }, [user?._id]);

  // Fetch numerology report
  useEffect(() => {
    if (!report && user) {
      const fetchReport = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/numerology-report`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.success) {
            setReport(data.data);
            setShowModal(true);
          } else {
            toast.error("Mislukt om numerologie rapport te laden");
          }
        } catch (error) {
          toast.error("Fout bij ophalen numerologie rapport");
        }
      };
      fetchReport();
    }
  }, [user, report]);

  const renderSummary = () => {
    if (!report || !report.numbers) return null;
    const { numbers } = report;
    return (
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-indigo-900 mb-4">
          Je Numerologie Snapshot 🌟
        </h2>
        <p className="text-gray-700 text-center mb-6">
          Hier is een snelle blik op de essentie van je numerologische reis:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Levenspad {numbers.lifepath.number}</h3>
              <p className="text-gray-600 text-sm">
                {numbers.lifepath.description}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Rocket className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-semibold">Expressie {numbers.expression.number}</h3>
              <p className="text-gray-600 text-sm">
                {numbers.expression.description}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-semibold">Hartgetal {numbers.soulurge.number}</h3>
              <p className="text-gray-600 text-sm">
                {numbers.soulurge.description}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="font-semibold">Persoonlijkheid {numbers.personality.number}</h3>
              <p className="text-gray-600 text-sm">
                {numbers.personality.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-indigo-900 sm:text-5xl">
            Je Numerologie Blauwdruk
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Ontdek de unieke energieën die je levensreis vormen. 🌈
          </p>
          <Badge className="mt-4 bg-indigo-500 text-white">Gepersonaliseerd Rapport</Badge>
        </div>

        {/* Summary Section */}
        {renderSummary()}

        {/* Detailed Report */}
        {report && report.numbers && (
          <Card className="mt-8 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-indigo-900">
                Je Kosmische Verhaal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {report.narrative}
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" /> Levenspadgetal: {report.numbers.lifepath.number}
                  </h3>
                  <p className="text-gray-600">{report.numbers.lifepath.description}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-blue-500" /> Expressiegetal: {report.numbers.expression.number}
                  </h3>
                  <p className="text-gray-600">{report.numbers.expression.description}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" /> Hartgetal: {report.numbers.soulurge.number}
                  </h3>
                  <p className="text-gray-600">{report.numbers.soulurge.description}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-500" /> Persoonlijkheidsgetal: {report.numbers.personality.number}
                  </h3>
                  <p className="text-gray-600">{report.numbers.personality.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">
            Klaar om Meer te Ontdekken?
          </h2>
          <p className="text-gray-600 mb-6">
            Verbind met een AI Tarot Psychic om dieper in je numerologische reis te duiken en verdere inzichten te ontgrendelen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="brand"
              className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-base sm:text-lg py-3 px-6 shadow-md transition-all duration-300"
              onClick={() => navigate(firstPsychicId ? `/chat/${firstPsychicId}` : "/chat")}
            >
              1 minuut gratis chat met een coach
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 py-3 px-6"
              onClick={() => navigate("/astrology-report")}
            >
              Ontgrendel Astrologie Rapport (5 Credits)
            </Button>
          </div>
        </div>

        {/* Modal for Initial Report Display */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg p-6 bg-white dark:bg-slate-950 rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-900">
                Je Numerologie Blauwdruk
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              {renderSummary()}
            </div>
            <Button
              variant="brand"
              className="mt-6 w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-base sm:text-lg py-3 px-6 shadow-md transition-all duration-300"
              onClick={() => setShowModal(false)}
            >
              Verken Volledig Rapport
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NumerologyReport;