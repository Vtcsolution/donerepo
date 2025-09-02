import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Sun, Zap, Target, Home, Briefcase, Heart, Sparkles, Flame, MessageSquare, Globe, Shield, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/All_Components/screen/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import axios from "axios";

// Vedic Chart Component
const VedicChart = ({ chart }) => {
  const houses = Array.from({ length: 12 }, (_, i) => i + 1);
  const planets = [
    { name: "Su", house: chart?.sun?.house || 1, symbol: "☉", color: "#FF6B35" },
    { name: "Mo", house: chart?.moon?.house || 4, symbol: "☽", color: "#4A90E2" },
    { name: "Ma", house: chart?.mars?.house || 7, symbol: "♂", color: "#E74C3C" },
    { name: "Me", house: chart?.mercury?.house || 2, symbol: "☿", color: "#2ECC71" },
    { name: "Ju", house: chart?.jupiter?.house || 5, symbol: "♃", color: "#F39C12" },
    { name: "Ve", house: chart?.venus?.house || 3, symbol: "♀", color: "#9B59B6" },
    { name: "Sa", house: chart?.saturn?.house || 10, symbol: "♄", color: "#34495E" },
    { name: "Ra", house: 8, symbol: "☊", color: "#8E44AD" },
    { name: "Ke", house: 2, symbol: "☋", color: "#E67E22" },
  ];

  const getHousePosition = (houseNum) => {
    const angle = ((houseNum - 1) * 30 - 90) * (Math.PI / 180);
    const radius = 120;
    return {
      x: 150 + radius * Math.cos(angle),
      y: 150 + radius * Math.sin(angle),
    };
  };

  return (
    <div className="relative w-80 h-80 mx-auto">
      <svg width="300" height="300" className="absolute inset-0">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#D4AF37" strokeWidth="3" />
        {houses.map((house) => {
          const angle = ((house - 1) * 30 - 90) * (Math.PI / 180);
          const x2 = 150 + 140 * Math.cos(angle);
          const y2 = 150 + 140 * Math.sin(angle);
          return <line key={house} x1="150" y1="150" x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="1" opacity="0.6" />;
        })}
        {houses.map((house) => {
          const pos = getHousePosition(house);
          return (
            <text
              key={house}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-amber-600 text-sm font-bold"
            >
              {house}
            </text>
          );
        })}
        {planets.map((planet) => {
          const pos = getHousePosition(planet.house);
          const offset = planets.filter((p) => p.house === planet.house).indexOf(planet) * 15;
          return (
            <g key={planet.name}>
              <circle cx={pos.x + offset - 7} cy={pos.y + 20} r="12" fill={planet.color} opacity="0.8" />
              <text
                x={pos.x + offset - 7}
                y={pos.y + 25}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-xs font-bold"
              >
                {planet.name}
              </text>
            </g>
          );
        })}
        <circle cx="150" cy="150" r="30" fill="url(#cosmicGradient)" />
        <text x="150" y="150" textAnchor="middle" dominantBaseline="middle" className="fill-white text-sm font-bold">
          D1
        </text>
        <defs>
          <radialGradient id="cosmicGradient">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="100%" stopColor="#2C3E50" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

const PoeticInterpretation = ({ chart }) => {
  if (!chart) return null;

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg border border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Psychologische Astrologie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-white/50 rounded-lg border border-amber-100">
          <h3 className="text-lg font-semibold text-amber-800">Zon in {chart.sun.sign}</h3>
          <p className="text-amber-700">{chart.sun.description}</p>
        </div>
        <div className="p-4 bg-white/50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800">Maan in {chart.moon.sign}</h3>
          <p className="text-blue-700">{chart.moon.description}</p>
        </div>
        <div className="p-4 bg-white/50 rounded-lg border border-pink-100">
          <h3 className="text-lg font-semibold text-pink-800">Venus in {chart.venus.sign}</h3>
          <p className="text-pink-700">{chart.venus.description}</p>
        </div>
        <div className="p-4 bg-white/50 rounded-lg border border-red-100">
          <h3 className="text-lg font-semibold text-red-800">Mars in {chart.mars.sign}</h3>
          <p className="text-red-700">{chart.mars.description}</p>
        </div>
        <div className="p-4 bg-white/50 rounded-lg border border-green-100">
          <h3 className="text-lg font-semibold text-green-800">Mercurius in {chart.mercury.sign}</h3>
          <p className="text-green-700">{chart.mercury.description}</p>
        </div>
        <div className="p-4 bg-white/50 rounded-lg border border-yellow-100">
          <h3 className="text-lg font-semibold text-yellow-800">Jupiter in {chart.jupiter.sign}</h3>
          <p className="text-yellow-700">{chart.jupiter.description}</p>
        </div>
        <div className="p-4 bg-white/50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Saturnus in {chart.saturn.sign}</h3>
          <p className="text-gray-700">{chart.saturn.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const CosmicStory = ({ chart, numerology }) => {
  if (!chart || !numerology) return null;
  return <div>{/* CosmicStory implementation */}</div>;
};

const AstrologyReport = ({ openPaymentModal }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(location.state?.astrologyReport || null);
  const [showModal, setShowModal] = useState(!!location.state?.astrologyReport);
  const [currentStep, setCurrentStep] = useState(1);
  const [userCredits, setUserCredits] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [firstPsychicId, setFirstPsychicId] = useState(null);
  const [pdfReport, setPdfReport] = useState(null);
  const [isPdfSubmitting, setIsPdfSubmitting] = useState(false);
const [gender, setGender] = useState("");
  const [genderError, setGenderError] = useState("");
  useEffect(() => {
    const fetchFirstTarotPsychic = async () => {
      try {
        if (!user?._id) {
          console.log("No user ID, skipping psychic fetch");
          return;
        }
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/psychics/type/Astrology`,
          { withCredentials: true }
        );
        const psychics = res.data?.data || [];
        if (psychics.length > 0) {
          setFirstPsychicId(psychics[0]._id);
          console.log("Fetched psychic ID:", psychics[0]._id);
        } else {
          toast.error("No Astrology Coach found.");
          console.log("No psychics found in response");
        }
      } catch (err) {
        console.error("Failed to fetch Astrology Coach:", err.response?.data || err.message);
        toast.error("Failed to load Astrology Coach data.");
      }
    };

    const fetchUserCredits = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setUserCredits(data.credits || 0);
        } else {
          console.error("Failed to fetch credits:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch user credits:", error);
      }
    };

   const fetchReport = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/astrology-report`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success && data.data) {
      setReport(data.data);
      setShowModal(true);
    } else {
      setReport(null);
      toast.info("No existing astrology report found. Generate a new one!");
    }
  } catch (error) {
    console.error("Error fetching astrology report:", error);
    setReport(null);
    toast.error("Failed to fetch astrology report.");
  }
};

   const fetchPdfReport = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/pdf-astrology-reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success && data.data.length > 0) {
      setPdfReport(data.data[0]); // Assume one PDF per user
    }
  } catch (error) {
    console.error("Error fetching PDF report:", error);
  }
};

    // Check user and birth details
    if (!user) {
      toast.error("Please log in to unlock the astrology report");
      navigate("/register");
      return;
    }
    if (!user.birthTime || !user.birthPlace) {
      toast.error("Please update your profile with birth time and place to unlock the astrology report");
      navigate("/profile");
      return;
    }

    fetchUserCredits();
    fetchFirstTarotPsychic();

    // Handle forceNew flag from AstrologyReportTable
    if (location.state?.forceNew) {
      setReport(null); // Clear existing report
      handleAstrologyUnlock(); // Trigger new report generation
    } else {
      fetchReport(); // Fetch existing report
    }

    fetchPdfReport();
  }, [user, navigate, location.state]);

  const handleAstrologyUnlock = async () => {
    setIsSubmitting(true);
    setModalType("astrology");
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/astrology-report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setReport(data.data);
        setShowModal(true);
        toast.success("Astrology Report generated successfully!");
        navigate("/astrology-report", { replace: true }); // Clear forceNew state
      } else {
        if (data.message.includes("Insufficient credits")) {
          setShowConfirmModal(true);
        } else {
          toast.error(data.message || "Failed to generate Astrology Report.");
        }
      }
    } catch (error) {
      if (error.response?.data?.message?.includes("Insufficient credits")) {
        setShowConfirmModal(true);
      } else {
        toast.error("Error generating Astrology Report.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

const handlePdfUnlock = async () => {
  if (!gender) {
    setGenderError("Please select your gender.");
    return;
  }
  setGenderError("");

  // Validate user profile data
  if (!user.username || !user.dob || !user.birthTime || !user.birthPlace) {
    toast.error("Please update your profile with your name, date of birth, birth time, and birth place.");
    navigate("/profile");
    return;
  }

  setIsPdfSubmitting(true);
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/generate-pdf-astrology-report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gender }), // Only send gender, as other fields are in user profile
    });
    const data = await response.json();
    if (data.success) {
      setPdfReport(data.data);
      await fetchUserCredits(); // Refetch credits
      toast.success("PDF Astrology Report generated successfully!");
    } else {
      if (data.message.includes("Insufficient credits")) {
        setShowConfirmModal(true);
        setModalType("pdf-astrology");
      } else {
        toast.error(data.message || "Failed to generate PDF Astrology Report.");
      }
    }
  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (error.response?.data?.message?.includes("Insufficient credits")) {
      setShowConfirmModal(true);
      setModalType("pdf-astrology");
    } else {
      toast.error(error.response?.data?.message || "Error generating PDF Astrology Report.");
    }
  } finally {
    setIsPdfSubmitting(false);
  }
};

  const handleUnlockMonthlyForecast = async () => {
    setIsSubmitting(true);
    setModalType("monthly-forecast");
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/monthly-forecast`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        navigate("/monthly-forecast", { state: { monthlyForecast: data.data } });
        toast.success("Monthly Forecast Report unlocked successfully!");
      } else {
        if (data.message.includes("Insufficient credits")) {
          setShowConfirmModal(true);
        } else {
          toast.error(data.message || "Failed to unlock Monthly Forecast Report.");
        }
      }
    } catch (error) {
      if (error.response?.data?.message?.includes("Insufficient credits")) {
        setShowConfirmModal(true);
      } else {
        toast.error("Error unlocking Monthly Forecast Report.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmUnlock = () => {
    setShowConfirmModal(false);
    if (openPaymentModal) {
      openPaymentModal();
    } else {
      navigate("/wallet/add-credits");
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderSummary = () => {
    if (!report || !report.chart || !report.numerology) return null;
    const { chart, numerology } = report;
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg border border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Je Kosmische Overzicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-700 text-center mb-6">
            Hier is een glimp van je astrologische en numerologische blauwdruk:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-purple-100">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-purple-800">Zon in {chart.sun.sign} (Huis {chart.sun.house})</h3>
                <Badge className="mt-2 bg-yellow-500 text-white">Kern Identiteit</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-blue-100">
              <Heart className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="font-semibold text-blue-800">Maan in {chart.moon.sign} (Huis {chart.moon.house})</h3>
                <Badge className="mt-2 bg-red-500 text-white">Emotionele Kern</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-pink-100">
              <Flame className="h-6 w-6 text-pink-500" />
              <div>
                <h3 className="font-semibold text-pink-800">Venus in {chart.venus.sign} (Huis {chart.venus.house})</h3>
                <Badge className="mt-2 bg-pink-500 text-white">Liefde & Harmonie</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-red-100">
              <Flame className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Mars in {chart.mars.sign} (Huis {chart.mars.house})</h3>
                <Badge className="mt-2 bg-red-500 text-white">Drive & Passie</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-green-100">
              <MessageSquare className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-800">Mercurius in {chart.mercury.sign} (Huis {chart.mercury.house})</h3>
                <Badge className="mt-2 bg-green-500 text-white">Communicatie</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-yellow-100">
              <Globe className="h-6 w-6 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-yellow-800">Jupiter in {chart.jupiter.sign} (Huis {chart.jupiter.house})</h3>
                <Badge className="mt-2 bg-yellow-500 text-white">Groei & Wijsheid</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-gray-200">
              <Shield className="h-6 w-6 text-gray-500" />
              <div>
                <h3 className="font-semibold text-gray-800">Saturnus in {chart.saturn.sign} (Huis {chart.saturn.house})</h3>
                <Badge className="mt-2 bg-gray-500 text-white">Discipline</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStep1 = () => (
    <div className="grid lg:grid-cols-1 gap-6 mb-8">
      <div className="lg:col-span-2">
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg border border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Geboortekaart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VedicChart chart={report?.chart} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <Badge variant="outline" className="border-blue-400 text-blue-400">
                  Maan: {report?.chart?.moon?.sign || "Onbekend"}
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="border-orange-400 text-orange-400">
                  Zon: {report?.chart?.sun?.sign || "Onbekend"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div></div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 mb-8">
      {renderSummary()}
      <PoeticInterpretation chart={report?.chart} />
    </div>
  );

 const renderStep3 = () => {
  if (!report || !report.chart || !report.numerology) {
    return (
      <div className="text-center text-purple-700">
        <p>No report data available. Please generate a report first.</p>
        <Button
          variant="brand"
          className="mt-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          onClick={handleAstrologyUnlock}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Generate Report (5 Credits)"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg border border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Planetaire Inzichten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { planet: "sun", icon: Sparkles, color: "amber", label: "Kern Identiteit", influence: 80 },
              { planet: "moon", icon: Heart, color: "blue", label: "Emotionele Kern", influence: 75 },
              { planet: "venus", icon: Flame, color: "pink", label: "Liefde & Harmonie", influence: 70 },
              { planet: "mars", icon: Flame, color: "red", label: "Drive & Passie", influence: 65 },
              { planet: "mercury", icon: MessageSquare, color: "green", label: "Communicatie", influence: 72 },
              { planet: "jupiter", icon: Globe, color: "yellow", label: "Groei & Wijsheid", influence: 78 },
              { planet: "saturn", icon: Shield, color: "gray", label: "Discipline", influence: 68 },
            ].map(({ planet, icon: Icon, color, label, influence }) => (
              <div key={planet} className={`p-4 bg-white/50 rounded-lg border border-${color}-100`}>
                <h3 className={`text-xl font-semibold text-${color}-800 flex items-center gap-2`}>
                  <Icon className={`h-5 w-5 text-${color}-500`} />
                  {planet.charAt(0).toUpperCase() + planet.slice(1)} in {report.chart[planet]?.sign || "Unknown"} (Huis {report.chart[planet]?.house || "Unknown"})
                </h3>
                <p className={`text-${color}-700 text-sm mt-2`}>{report.chart[planet]?.description || "No description available."}</p>
                <Progress value={influence} className={`h-2 mt-2 bg-white border border-${color}-200`} />
                <p className={`text-${color}-600 text-xs mt-1`}>Invloed: {influence}%</p>
                <Badge className={`mt-2 bg-${color}-500 text-white`}>{label}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <CosmicStory chart={report.chart} numerology={report.numerology} />
    </div>
  );
};

  const renderNoReport = () => (
    <div className="p-4 bg-white rounded-lg shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-w-xs mx-auto">
      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Astrologische Blauwdruk</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Ontdek inzichten uit je zon, maan en ascendant tekens.
      </p>
      <Button
        variant="brand"
        size="sm"
        className="w-full rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm"
        onClick={handleAstrologyUnlock}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verwerken...
          </span>
        ) : (
          "Ontgrendel (5 Credits)"
        )}
      </Button>
    </div>
  );

const renderPdfSection = () => (
  <div className="mt-8">
   
  </div>
);

  const stepProgress = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;
  const stepLabel = currentStep === 1 ? "Geboortekaart" : currentStep === 2 ? "Kosmische Inzichten" : "Gedetailleerde Analyse";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-amber-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900">Astrologie Rapport</h1>
          <p className="text-purple-700">Analyse Geboortekaart & Levensbegeleiding</p>
          <Badge className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            Gepersonaliseerd Astrologie Rapport
          </Badge>
        </div>

        {!report ? (
  renderNoReport()
) : (
  <>
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-purple-800 font-medium">Stap {currentStep}: {stepLabel}</span>
        <span className="text-purple-700 text-sm">{stepProgress}% Voltooid</span>
      </div>
      <Progress value={stepProgress} className="h-3 bg-white border border-purple-200" />
    </div>

    {currentStep === 1 && renderStep1()}
    {currentStep === 2 && renderStep2()}
    {currentStep === 3 && renderStep3()}
    {renderPdfSection()} {/* Always show PDF section */}

    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        className="rounded-full border-purple-600 text-purple-600 hover:bg-purple-50"
        onClick={handlePrevious}
        disabled={currentStep === 1}
      >
        Vorige
      </Button>
      {currentStep < 3 && (
        <Button
          variant="brand"
          className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          onClick={handleNext}
        >
          Volgende
        </Button>
      )}
    </div>
            <div className="text-center mt-8">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Klaar om Meer te Verkennen?</h2>
              <p className="text-purple-700 mb-6">Verbind met een coach om dieper in je kosmische reis te duiken of ontgrendel extra inzichten.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="brand"
                  className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={() => {
                    console.log("Navigating to chat, firstPsychicId:", firstPsychicId);
                    navigate(firstPsychicId ? `/chat/${firstPsychicId}` : "/chat");
                  }}
                >
                  Chat nu met je AI Coach
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-purple-600 text-purple-600 hover:bg-purple-50"
                  onClick={() => navigate("/numerology-report")}
                >
                  Je Numerologie Rapport
                </Button>
              </div>
            </div>

            <div className="text-center mt-8 text-purple-700 text-sm">
              <p>✨ Gegenereerd met kosmische wijsheid en Vedische berekeningen ✨</p>
            </div>
          </>
        )}

        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-50 bg-white dark:bg-slate-950 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
              <DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-500 dark:text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <DialogTitle className="text-lg font-semibold text-center text-gray-900 dark:text-white">
                    Onvoldoende Credits
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Je hebt {modalType === "astrology" ? 5 : modalType === "pdf-astrology" ? 15 : 10} credits nodig om deze functie te ontgrendelen.
                    <br />
                    Huidig saldo: {userCredits} credits
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="mt-6 flex justify-center space-x-3">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  variant="outline"
                  className="px-4 py-1.5 text-sm rounded-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={handleConfirmUnlock}
                  variant="default"
                  className="px-4 py-1.5 text-sm rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                >
                  Credits Toevoegen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AstrologyReport;