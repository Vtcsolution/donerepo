import { useEffect, useState } from "react";
import { useAuth } from "@/All_Components/screen/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";

const LoveReportDetail = () => {
  const { user } = useAuth();
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [firstPsychicId, setFirstPsychicId] = useState(null);

  // Fetch first Tarot psychic
  useEffect(() => {
    const fetchFirstTarotPsychic = async () => {
      try {
        if (!user?._id) return; // Wait for user auth
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/psychics/type/Love`,
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
    const fetchReport = async () => {
      if (!user) {
        toast.error("Please log in to view your report.");
        navigate("/login");
        return;
      }
      setIsLoading(true);
      setErrorMessage("");
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/love-compatibility-report/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setReport(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch report details.");
          setErrorMessage(response.data.message || "Failed to fetch report details.");
        }
      } catch (error) {
        console.error("Failed to fetch report:", error);
        const message = error.response?.data?.message || "An error occurred while fetching the report.";
        toast.error(message);
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [user, reportId, navigate]);

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

  // Render the detailed report
  const renderReport = () => {
    if (!report) return null;

    const { narrative, chart, yourName, partnerName, createdAt, partialDataWarning } = report;
    const planets = ["sun", "moon", "venus", "mars", "mercury", "jupiter", "saturn"];
    const compatibilityScoreMatch = narrative.match(/compatibiliteitsscore van (\d+)%/);
    const compatibilityScore = compatibilityScoreMatch ? parseInt(compatibilityScoreMatch[1]) : null;

    if (!compatibilityScore) {
      console.error("Failed to extract compatibility score from narrative:", narrative);
      toast.error("Error: Could not determine compatibility score. Please try viewing another report.");
      return null;
    }

    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-200 dark:border-blue-900 animate-fade-in">
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-4 mb-8 rounded-lg shadow-sm">
            <p className="font-semibold text-lg">Error</p>
            <p>{errorMessage}</p>
          </div>
        )}
        {partialDataWarning && (
          <div className="bg-yellow-50 border-l-4 border-yellow-600 text-yellow-800 p-4 mb-8 rounded-lg shadow-sm">
            <p className="font-semibold text-lg">Partial Data Warning</p>
            <p>{partialDataWarning}</p>
          </div>
        )}
        <h1 className="text-4xl font-sans font-bold text-center text-gray-900 dark:text-white mb-8">
          Liefdescompatibiliteitsrapport – {yourName} & {partnerName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Gegenereerd op {new Date(createdAt).toLocaleDateString()}
        </p>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-4">Stap 1: Jouw Kosmische Connectie</h2>
                  <div className="flex justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200 dark:text-slate-700 stroke-current"
                          strokeWidth="10"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        />
                        <circle
                          className="text-blue-600 stroke-current"
                          strokeWidth="10"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray={`${2.513 * compatibilityScore} ${2.513 * (100 - compatibilityScore)}`}
                          transform="rotate(-90 50 50)"
                        />
                        <g textAnchor="middle" dominantBaseline="middle" className="font-sans">
                          <text
                            x="50"
                            y="44"
                            className="text-[8px] font-medium tracking-wide text-gray-500 dark:text-gray-400"
                          >
                            Liefdesscore
                          </text>
                          <text
                            x="50"
                            y="58"
                            className="text-[14px] font-bold text-gray-900 dark:text-white"
                          >
                            {compatibilityScore}%
                          </text>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    🌟👑 Welkom, {yourName} en {partnerName}, op een reis geschreven in de sterren! 👑🌟

                    💫 Jullie liefde is een uniek tapijt, geweven uit hemelse draden die passie, emotie en lot samenbrengen.
                    💎 Met een compatibiliteitsscore van {compatibilityScore}% straalt jullie band pure potentie uit — belovend voor momenten vol vreugde en groei.

                    🌌 Laten we samen duiken in het kosmische verhaal van jullie harten, waar elke planeet een nieuw hoofdstuk onthult van jullie gedeelde avontuur.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic mt-4">
                    {narrative.split("\n").slice(0, 2).join("\n")}...
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mt-4">
                    🌠✨ Klaar om de kosmische krachten te ontdekken die jullie liefde vormgeven? ✨🌠
                    🌌 Laten we de planeten verkennen die jullie verbinding leiden en versterken.
                  </p>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    onClick={handleNextStep}
                    variant="brand"
                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg py-3 px-6 shadow-md transition-all duration-300"
                  >
                    Volgende: Planetaire Inzichten
                  </Button>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-4">✨ Stap 2: Planetaire Inzichten</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    🎨🌌 Jullie liefdesverhaal is geschilderd in de stralende kleuren van het universum, waar elke planeet een hoofdstuk vertelt over jullie verbinding. ✨💖

                    ☀️ Vanaf de zon, het stralende middelpunt, tot 💎 Venus, met haar tedere omhelzing – deze kosmische posities onthullen zowel de magie als de uitdagingen van jullie band.

                    🌠 Hier ontvouwt zich hoe jullie hemelse energieën samenkomen en een symfonie van liefde en groei creëren. 🎶💫
                  </p>
                </div>
                {planets.map((planet) => (
                  <div key={planet} className="bg-white dark:bg-slate-950 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 animate-fade-in-up">
                    <h3 className="text-xl font-sans font-medium text-blue-700 dark:text-blue-300 capitalize mb-4">{planet}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <strong className="font-semibold">{yourName}:</strong> {chart.user[planet].sign} in the {chart.user[planet].house} – {chart.user[planet].description}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <strong className="font-semibold">{partnerName}:</strong> {chart.partner[planet].sign} in the {chart.partner[planet].house} – {chart.partner[planet].description}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong className="font-semibold">Hoe jullie versmelten:</strong> {chart.user[planet].combined}
                    </p>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="rounded-full border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-6 w-full sm:w-auto"
                  >
                    Vorige: Jullie Kosmische Connectie
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    variant="brand"
                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-6 shadow-md transition-all duration-300 w-full sm:w-auto"
                  >
                    Volgende: Jullie liefdesmatch samengevat
                  </Button>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="bg-gray-50 dark:bg-slate-900 p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-4">Stap 3: Jullie Relatieverhaal</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    🌹 Beste {yourName} en {partnerName}

                    ✨ Jullie liefde is een hemels meesterwerk, geweven door de sterren om jullie unieke band te weerspiegelen.
                    💞 Dit overzicht verbindt de emotionele, passionele en spirituele draden van jullie relatie.
                    🌟 Het onthult zowel jullie sterke punten, als de uitdagingen, en de oneindige mogelijkheden die voor jullie openliggen.

                    💖 Laat deze kosmische gids jullie inspireren om jullie verbinding met liefde, aandacht en intentie te koesteren en te laten groeien.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line mt-4">
                    {narrative}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mt-4">
                    💖 Jullie liefde is een reis van hart en ziel, geleid door de sterren. ✨
                    🌌 Willen jullie deze verbinding verder verdiepen?
                    🔮 Ontdek meer of verbind je met een AI Love Psychic om jullie kosmische liefde tot leven te brengen!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="w-full sm:flex-1 rounded-full border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  >
                    Inzichten uit de planeten
                  </Button>
                  <Button
                    onClick={() => navigate(firstPsychicId ? `/chat/${firstPsychicId}` : "/chat")}
                    variant="brand"
                    className="w-full sm:flex-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg py-3 shadow-md transition-all duration-300"
                  >
                    Begin chat met AI-Helderzienden
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
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      {report ? renderReport() : (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl dark:bg-slate-950 border border-blue-200 dark:border-blue-900">
          <h2 className="text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-4">Report Not Found</h2>
          <p className="text-gray-700 dark:text-gray-300">
            The requested report could not be found or you do not have access to it.{" "}
            <a href="/love-reports" className="text-blue-600 dark:text-blue-400 hover:underline">
              View all reports
            </a>.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoveReportDetail;