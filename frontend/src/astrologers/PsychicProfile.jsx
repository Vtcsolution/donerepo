import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Star, MessageCircle, Clock, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const PsychicProfile = () => {
  const { psychicId } = useParams();
  const navigate = useNavigate();
  const [psychic, setPsychic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const fetchPsychicProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/psychics/profile/${psychicId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setPsychic(response.data.data.psychic);
        } else {
          toast.error(response.data.message || "Failed to fetch psychic profile");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching psychic profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPsychicProfile();
  }, [psychicId]);

  const nextReview = () => {
    setCurrentReviewIndex((prev) =>
      prev === psychic.feedback.length - 1 ? 0 : prev + 1
    );
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) =>
      prev === 0 ? psychic.feedback.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-cyan-50 dark:from-purple-900 dark:to-cyan-900">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-40 w-40 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!psychic) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-cyan-50 dark:from-purple-900 dark:to-cyan-900">
        <Card className="text-center p-6 max-w-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
              Coach niet gevonden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              De coach die je zoekt, bestaat niet of is mogelijk verwijderd.
            </p>
            <Button
              variant="brand"
              className="rounded-full px-6 py-2 text-sm font-medium"
              onClick={() => navigate("/")}
            >
              Browse Psychics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 animate-fade-in">
          <div className="md:w-1/3 flex justify-center">
            <div className="relative">
              <Avatar className="h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 border-2 border-white dark:border-gray-800 shadow-md ring-2 ring-purple-500/30 transition-transform duration-300 hover:scale-105">
                <AvatarImage src={psychic.image} alt={psychic.name} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 text-white">
                  {psychic.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
             <Badge className="absolute bottom-2 right-2 bg-emerald-500 font-medium px-3 py-1 rounded-full shadow-sm">
  {psychic.type}
</Badge>
            </div>
          </div>

          <div className="md:w-2/3 flex flex-col justify-center text-center md:text-left">
            <h1 className="text-4xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-up">
              {psychic.name}
            </h1>
            <p className="text-md text-gray-600 dark:text-gray-300 mb-4 max-w-xl animate-slide-up animation-delay-200">
              {psychic.bio}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 animate-slide-up animation-delay-400">
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(psychic.rating.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                {psychic.rating.averageRating.toFixed(1)} ({psychic.rating.feedbackCount} reviews)
              </span>
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button
                variant="brand"
                className="rounded-full px-6 py-2 text-base font-medium"
                onClick={() => {
                  const token = localStorage.getItem("accessToken");
                  if (!token) {
                    navigate("/login");
                    return;
                  }
                  navigate(`/`);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat (€{psychic.rate.perMinute.toFixed(2)}/min)
              </Button>
             
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Abilities Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-md rounded-xl animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Speciale vaardigheden
                </CardTitle>
                <CardDescription className="text-sm">Expertisegebieden</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {psychic.abilities.map((ability, idx) => (
                    <Badge
                      key={idx}
                      className="px-3 py-1 text-sm font-medium bg-[#3B5EB7] rounded-full"
                    >
                      {ability}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-md rounded-xl animate-slide-up animation-delay-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                 Prestatiestatistieken
                </CardTitle>
                <CardDescription className="text-sm">Sessiestatistieken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 p-4 rounded-lg text-center">
                    <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {psychic.chatStats.totalChats}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Totaal aantal chats</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 p-4 rounded-lg text-center">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {psychic.chatStats.totalMessages}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Berichten</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 p-4 rounded-lg text-center">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {psychic.chatStats.averageSessionDuration}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gem. minuten</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-md rounded-xl animate-slide-up animation-delay-400">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  About {psychic.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300">
                  <p>{psychic.bio}</p>
                  <p className="mt-3">
                    Met expertise in {psychic.type.toLowerCase()} en vaardigheden in {psychic.abilities.slice(0, 2).join(" and ")},
                    {psychic.name} Biedt inzichtelijke en gepersonaliseerde readings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reviews Carousel */}
          <div>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-md rounded-xl h-full animate-slide-up animation-delay-600">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                 Klantbeoordelingen
                </CardTitle>
                <CardDescription className="text-sm">Ervaringen van klanten</CardDescription>
              </CardHeader>
              <CardContent>
                {psychic.feedback.length > 0 ? (
                  <div className="relative">
                    {/* Review Carousel */}
                    <div className="overflow-hidden">
                      <div
                        className="transition-transform duration-300 ease-in-out"
                        style={{
                          transform: `translateX(-${currentReviewIndex * 100}%)`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {psychic.feedback.map((f, idx) => (
                          <div
                            key={idx}
                            className="inline-block w-full align-top p-3"
                            style={{ whiteSpace: "normal" }}
                          >
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-5 rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 hover:rotate-1">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={f.userImage || "/default-avatar.jpg"} />
                                    <AvatarFallback className="text-sm">{f.userName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{f.userName}</h4>
                                    <div className="flex">
                                      {Array(5).fill(0).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < f.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300 dark:text-gray-600"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(f.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                                {f.message}
                              </p>
                              {f.gift?.type && (
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                                    Gift: {f.gift.type} ({f.gift.credits} credits)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Carousel Controls */}
                    <div className="flex justify-between mt-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevReview}
                        className="rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70"
                        disabled={psychic.feedback.length <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        {psychic.feedback.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentReviewIndex(idx)}
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${
                              idx === currentReviewIndex
                                ? "bg-purple-600 w-3"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                            aria-label={`Go to review ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextReview}
                        className="rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70"
                        disabled={psychic.feedback.length <= 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600 mb-3" />
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Nog geen reviews
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Wees de eerste die jouw ervaring deelt met {psychic.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default PsychicProfile;