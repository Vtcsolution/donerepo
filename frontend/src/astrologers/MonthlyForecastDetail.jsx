import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/All_Components/screen/AuthContext";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import Chart from "chart.js/auto";

const MonthlyForecastDetail = () => {
  const { user } = useAuth();
  const { reportId } = useParams(); // Get reportId from URL
  const navigate = useNavigate();
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [firstPsychicId, setFirstPsychicId] = useState(null);
  const [openCollapsible, setOpenCollapsible] = useState({
    overview: true,
    career: false,
    relationships: false,
    personalGrowth: false,
    challenges: false,
    sun: false,
    moon: false,
  });
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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
          toast.error("No Tarot psychics found.");
        }
      } catch (err) {
        console.error("❌ Failed to fetch Tarot psychics:", err.response?.data || err.message);
        toast.error("Failed to load Tarot psychic data.");
      }
    };

    fetchFirstTarotPsychic();
  }, [user?._id]);

  // Fetch report by ID
  useEffect(() => {
    const fetchReportById = async () => {
      if (!user || !reportId) {
        toast.error("Please log in to view your report.");
        navigate("/login");
        return;
      }
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          toast.error("Please log in again to access your report.");
          navigate("/login");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/monthly-forecast/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setForecast(response.data.data);
          setCurrentStep(1);
        } else {
          toast.error(response.data.message || "Couldn't fetch your report. Please try again.");
          navigate("/monthly-forecasts");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        toast.error(error.response?.data?.message || "An error occurred. Please try again or contact support.");
        navigate("/monthly-forecasts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportById();
  }, [user, reportId, navigate]);

  // Initialize chart with dynamic data from backend
  useEffect(() => {
    if (currentStep === 1 && forecast && chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Calculate weights based on forecast content length
      const calculateFocusWeights = () => {
        if (!forecast.forecast) return [25, 25, 25, 25];

        const careerLength = forecast.forecast.career?.length || 0;
        const relationshipsLength = forecast.forecast.relationships?.length || 0;
        const personalGrowthLength = forecast.forecast.personalGrowth?.length || 0;
        const challengesLength = forecast.forecast.challenges?.length || 0;

        const total = careerLength + relationshipsLength + personalGrowthLength + challengesLength;

        if (total === 0) return [25, 25, 25, 25];

        return [
          Math.round((careerLength / total) * 100),
          Math.round((relationshipsLength / total) * 100),
          Math.round((personalGrowthLength / total) * 100),
          Math.round((challengesLength / total) * 100),
        ];
      };

      const focusWeights = calculateFocusWeights();

      chartInstanceRef.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Career", "Relationships", "Personal Growth", "Challenges"],
          datasets: [{
            label: "Your Cosmic Focus",
            data: focusWeights,
            backgroundColor: ["#4C78FF", "#FF6B6B", "#4ECDC4", "#FFD166"],
            borderColor: ["#3B5FCC", "#CC5555", "#3BA099", "#CCA33D"],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "#333",
                font: { size: 14 },
                padding: 20,
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                },
              },
            },
            title: {
              display: true,
              text: `Your Cosmic Focus for ${monthNames[forecast.predictionMonth - 1]} ${forecast.predictionYear}`,
              color: "#333",
              font: { size: 18 },
              padding: {
                top: 10,
                bottom: 20,
              },
            },
          },
          animation: {
            animateScale: true,
            animateRotate: true,
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [currentStep, forecast]);

  // Handle navigation between steps
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Toggle collapsible sections
  const toggleCollapsible = (section) => {
    setOpenCollapsible((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to extract action tips
  const extractActionTip = (text) => {
    if (!text) return "Try something new this month to align with this energy!";
    const tipMatch = text.match(/For example, (.*?)(\.|$)/);
    return tipMatch ? tipMatch[1] : "Try something new this month to align with this energy!";
  };

  // Render forecast
  const renderForecast = () => {
    if (!forecast) return null;
    const { narrative, chart, forecast: forecastDetails, predictionMonth, predictionYear } = forecast;
    const defaultMessage = "The stars are still aligning for this section. Chat with an AI Tarot Psychic for deeper insights! 🌟";

    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-900 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-center text-gray-900 dark:text-white mb-6 sm:mb-8">
          🔮 Jouw Kosmische Voorspelling voor {monthNames[predictionMonth - 1]} {predictionYear} ✨
        </h1>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Progress Indicator */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center">
                {["Cosmic Overview", "Celestial Insights", "Your Cosmic Journey"].map((step, index) => (
                  <div key={index} className="flex-1 text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                        currentStep > index + 1
                          ? "bg-blue-600 text-white"
                          : currentStep === index + 1
                          ? "bg-blue-400 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-xs sm:text-sm mt-2 text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
              <div className="h-1 bg-gray-200 dark:bg-slate-700 mt-4">
                <div
                  className="h-1 bg-blue-600 transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-4">Stap 1: Kosmisch Overzicht</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                    Welkom bij je persoonlijke voorspelling voor {monthNames[predictionMonth - 1]} {predictionYear}! Dit is jouw routekaart naar wat de sterren voor je in petto hebben, aangedreven door actuele planetaire transities. De onderstaande kaart laat de belangrijkste gebieden van je leven zien die deze maand beïnvloed worden.
                  </p>
                  <div className="my-4 sm:my-6 h-64">
                    <canvas ref={chartRef} className="max-w-full h-full mx-auto"></canvas>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed italic">
                    {narrative.split("\n")[0]}...
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                     Laten we dieper ingaan op de begeleiding van de sterren voor jou. Klik op "Volgende" om verder te ontdekken!
                  </p>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    onClick={handleNextStep}
                    variant="brand"
                    className="w-full sm:w-auto rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg py-3 px-6 shadow-md transition-all duration-300"
                  >
Volgende: Sterreninzichten                  </Button>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-4">Stap 2: Kosmische Inzichten</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                  Zo beïnvloeden de sterren en planeten jouw maand. Je Zonneteken is je innerlijke vonk, je Maanteken stuurt je gevoelens, en actuele transities laten de belangrijkste invloeden zien. Klik op elk onderdeel voor persoonlijke tips!
                  </p>
                </div>
                <div className="space-y-4">
                  <Collapsible open={openCollapsible.sun} onOpenChange={() => toggleCollapsible("sun")}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-blue-50 rounded-md dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Jouw Zonneteken: {chart?.sun?.sign || "Unknown"} ☀️</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">(Je kernpersoonlijkheid)</span>
                      </div>
                      {openCollapsible.sun ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {chart?.sun?.description || defaultMessage}
                    </CollapsibleContent>
                  </Collapsible>
                  <Collapsible open={openCollapsible.moon} onOpenChange={() => toggleCollapsible("moon")}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-blue-50 rounded-md dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                         <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Jouw Maanteken: {chart?.moon?.sign || "Onbekend"} 🌙</h3>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">(Je emoties)</span>
      </div>
                      {openCollapsible.moon ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {chart?.moon?.description || defaultMessage}
                    </CollapsibleContent>
                  </Collapsible>
                  <Collapsible open={openCollapsible.overview} onOpenChange={() => toggleCollapsible("overview")}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-blue-50 rounded-md dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Overzicht 🌌</h3>
                      {openCollapsible.overview ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {forecastDetails?.overview || defaultMessage}
                      {forecastDetails?.overview && (
                        <div className="mt-2"><strong>Tip:</strong> {extractActionTip(forecastDetails.overview)}</div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  <Collapsible open={openCollapsible.career} onOpenChange={() => toggleCollapsible("career")}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-blue-50 rounded-md dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Carrière & Doel 💼</h3>
                      {openCollapsible.career ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {forecastDetails?.career || defaultMessage}
                      {forecastDetails?.career && (
                        <div className="mt-2"><strong>Tip:</strong> {extractActionTip(forecastDetails.career)}</div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  <Collapsible open={openCollapsible.relationships} onOpenChange={() => toggleCollapsible("relationships")}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-blue-50 rounded-md dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700">
                           <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Relaties & Verbindingen 💞</h3>

                      {openCollapsible.relationships ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {forecastDetails?.relationships || defaultMessage}
                      {forecastDetails?.relationships && (
                        <div className="mt-2"><strong>Tip:</strong> {extractActionTip(forecastDetails.relationships)}</div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  <Collapsible open={openCollapsible.personalGrowth} onOpenChange={() => toggleCollapsible("personalGrowth")}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-blue-50 rounded-md dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700">
                       <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Persoonlijke Groei & Spiritualiteit 🌱</h3>
                      {openCollapsible.personalGrowth ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {forecastDetails?.personalGrowth || defaultMessage}
                      {forecastDetails?.personalGrowth && (
                        <div className="mt-2"><strong>Tip:</strong> {extractActionTip(forecastDetails.personalGrowth)}</div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  <Collapsible open={openCollapsible.challenges} onOpenChange={() => toggleCollapsible("challenges")}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-blue-50 rounded-md dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700">
                     <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Uitdagingen & Praktisch Advies ⚖️</h3>
                      {openCollapsible.challenges ? (
                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {forecastDetails?.challenges || defaultMessage}
                      {forecastDetails?.challenges && (
                        <div className="mt-2"><strong>Tip:</strong> {extractActionTip(forecastDetails.challenges)}</div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="w-full sm:flex-1 rounded-full border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 py-3 px-6"
                  >
                    Vorige: Kosmisch Overzicht
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    variant="brand"
                    className="w-full sm:flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg py-3 px-6 shadow-md transition-all duration-300"
                  >
Volgende: Jouw Kosmische Reis                  </Button>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-4">✨ Stap 3: Jouw Kosmische Reis</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                    Hier is jouw volledige kosmische verhaal voor {monthNames[predictionMonth - 1]} {predictionYear}. We hebben je Zon, Maan en actuele planetaire transities samengebracht om je te begeleiden. Lees elk onderdeel om te ontdekken hoe de sterren jouw pad verlichten!
                  </p>
                  {narrative.split("\n").map((paragraph, index) => (
                    <div key={index} className="mt-4">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                        {index === 0 ? "Your Month Begins" : `Key Insight ${index + 1}`}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                        {paragraph}
                      </p>
                    </div>
                  ))}
                  <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed mt-4">
                     Jouw kosmische reis is een unieke ontdekkingstocht. Wil je meer verkennen? Chat met een coach of deel je gedachten!

                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="w-full sm:flex-1 rounded-full border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 py-3 px-6"
                  >
                    Previous: Celestial Insights
                  </Button>
                  <Button
                    onClick={() => navigate(firstPsychicId ? `/chat/${firstPsychicId}` : "/chat")}
                    variant="brand"
                    className="w-full sm:flex-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-base sm:text-lg py-3 px-6 shadow-md transition-all duration-300"
                  >
                     Chat met een AI-coach
                  </Button>
                </div>
                <div className="flex justify-center">
                 
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : forecast ? (
        renderForecast()
      ) : (
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Unable to load your personalized cosmic forecast. Please try again.
          </p>
          <Button
            onClick={() => navigate("/monthly-forecasts")}
            variant="brand"
            className="mt-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg py-3 px-6 shadow-md transition-all duration-300"
          >
            Back to Reports
          </Button>
        </div>
      )}
    </div>
  );
};

export default MonthlyForecastDetail;