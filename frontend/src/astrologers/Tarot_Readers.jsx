/* eslint-disable no-unused-vars */
import { Mail, MessageCircle, Sparkles, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import CategoryHeader from "@/Advisors_Components/Header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/All_Components/screen/AuthContext";
import axios from "axios";
import { ProfileSection } from "@/All_Components/Short_COmponents/Profiles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

export default function Tarot_Readers() {
  const [first, setFirst] = useState(false);
  const [showing, setShowing] = useState(5);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [psychics, setPsychics] = useState([]);
  const [tabCounts, setTabCounts] = useState({
    active: 0,
    chat: 0,
    new: 0,
  });
  const [birthChartData, setBirthChartData] = useState({
    name: "",
    gender: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    birthHour: "",
    birthMinute: "",
    birthPlace: "",
    birthSeconds: "",
  });

  useEffect(() => {
    const fetchTarotReaders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/psychics/type/Tarot`
        );
        console.log("Fetched tarot psychics:", res.data.data);

        if (res.data.success) {
          const psychicsData = res.data.data || [];

          const psychicsWithFeedback = await Promise.all(
            psychicsData.map(async (psychic) => {
              try {
                const feedbackRes = await axios.get(
                  `${import.meta.env.VITE_BASE_URL}/api/feedback/psychic/${psychic._id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${user?.token || localStorage.getItem("accessToken")}`,
                    },
                  }
                );
                const feedbackData = feedbackRes.data.overall.feedback || [];
                console.log(`Feedback for psychic ${psychic._id}:`, feedbackData);
                const latestFeedback = feedbackData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                return {
                  ...psychic,
                  rating: {
                    avgRating: feedbackRes.data.overall.averageRating || 0,
                    ratingCount: feedbackRes.data.overall.feedbackCount || 0,
                  },
                  latestReview: latestFeedback
                    ? {
                        userName: latestFeedback.userName || "Anonymous",
                        rating: latestFeedback.rating || 0,
                        text: latestFeedback.message || "No recent review available.",
                      }
                    : null,
                };
              } catch (err) {
                console.error(`Failed to fetch feedback for psychic ${psychic._id}:`, err);
                return {
                  ...psychic,
                  rating: { avgRating: 0, ratingCount: 0 },
                  latestReview: null,
                };
              }
            })
          );

          setPsychics(psychicsWithFeedback);
          setTabCounts({
            active: psychicsWithFeedback.filter((p) => p.status === "online").length,
            chat: psychicsWithFeedback.filter((p) => p.rate?.perMinute).length,
            new: psychicsWithFeedback.filter(
              (p) =>
                p.isNew ||
                new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length,
          });
        } else {
          console.error("API response unsuccessful:", res.data);
        }
      } catch (err) {
        console.error("Error fetching tarot readers:", err);
        setPsychics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTarotReaders();
  }, [user]);

  const handleShowMore = () => {
    setShowing((prev) => prev + 5);
  };

  const handleBirthChartSubmit = (e) => {
    e.preventDefault();
    console.log("Birth Chart Data:", birthChartData);
  };

  const navigate = useNavigate();
  const handlePuch = () => {
    navigate("/tarot-reader-detail");
  };

  useEffect(() => {
    const {
      name,
      gender,
      birthDay,
      birthMonth,
      birthYear,
      birthHour,
      birthMinute,
      birthPlace,
      birthSeconds,
    } = birthChartData;

    setFirst(
      !!(
        name &&
        gender &&
        birthDay &&
        birthMonth &&
        birthYear &&
        birthHour &&
        birthMinute &&
        birthPlace &&
        birthSeconds
      )
    );
  }, [birthChartData]);

  return (
    <>
      <CategoryHeader
        title="Tarot Readers"
        description="Our Tarot Readers specialists can see and interpret the colors and energies surrounding you, providing insights into your emotional, mental, and spiritual state."
        icon={<Sparkles className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32" />}
        bgColor="bg-[#3291F6]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="wrapper">
              <Tabs defaultValue="active">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Find your advisor..."
                      className="w-full pl-10 pr-4 py-2 rounded-full border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                 
                </div>

                <TabsContent value="active">
                  <div className="grid gap-6">
                    {loading ? (
                      <p className="text-center mt-6">Loading profiles...</p>
                    ) : psychics.length === 0 ? (
                      <p className="text-center mt-6">No tarot readers available.</p>
                    ) : (
                      psychics.slice(0, showing).map((psychic, i) => (
                        <Card
                          key={psychic._id || i}
                          className="w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-6">
                              <div className="flex flex-col items-center sm:w-48 shrink-0">
                                <div className="relative rounded-full border-4 border-violet-100 dark:border-violet-900">
                                  <img
                                    src={psychic.image || "/placeholder.svg"}
                                    alt={psychic.name}
                                    className="object-cover h-24 w-24 sm:h-32 sm:w-32 rounded-full"
                                  />
                                </div>
                                <div className="mt-4 text-center">
                                  <h3 className="text-lg sm:text-xl font-semibold">{psychic.name}</h3>
                                  <p className="text-sm text-slate-700 dark:text-slate-200">
                                    {psychic.type || "Tarot Reader"}
                                  </p>
                                  <div className="mt-1 flex items-center justify-center">
                                    {Array(Math.round(psychic.rating?.avgRating || 0))
                                      .fill(0)
                                      .map((_, i) => (
                                        <svg
                                          key={i}
                                          className="h-4 w-4 fill-amber-400 text-amber-400"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                  </div>
                                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {psychic.rating?.ratingCount || 0} reviews
                                  </p>
                                  <Badge className="mt-2 bg-emerald-500">
                                    {psychic.status === "online" ? "Available" : psychic.status || "Offline"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  {(psychic.abilities || psychic.skills || []).map((ability, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                                    >
                                      {ability}
                                    </Badge>
                                  ))}
                                </div>

                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {psychic.bio || psychic.description || "No bio available."}
                                </p>

                                {psychic.latestReview ? (
                                  <div className="mt-4">
                                    <h4 className="font-medium text-slate-900 dark:text-white">Latest Review</h4>
                                    <div className="mt-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                         
                                          <p className="font-medium">
                                            {psychic.latestReview?.userName || "Anonymous"}
                                          </p>
                                        </div>
                                        <div className="flex">
                                          {psychic.latestReview?.rating ? (
                                            Array(Math.round(psychic.latestReview.rating))
                                              .fill(0)
                                              .map((_, i) => (
                                                <svg
                                                  key={i}
                                                  className="h-3 w-3 fill-amber-400 text-amber-400"
                                                  viewBox="0 0 20 20"
                                                  fill="currentColor"
                                                >
                                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                              ))
                                          ) : (
                                            <p className="text-sm text-gray-400 italic">No rating</p>
                                          )}
                                        </div>
                                      </div>
                                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                        {psychic.latestReview?.text || "No review available."}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-4">
                                    <h4 className="font-medium text-slate-900 dark:text-white">Latest Review</h4>
                                    <div className="mt-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src="/default-user.png"
                                          alt="Anonymous"
                                          className="w-6 h-6 rounded-full"
                                        />
                                        <p className="font-medium">Anonymous</p>
                                      </div>
                                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic">
                                        No review available.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="mt-6 flex flex-wrap gap-3">
                                  <Button
                                    variant="brand"
                                    className="rounded-full gap-2"
                                    onClick={() => {
                                      if (!user) {
                                        navigate("/login");
                                        return;
                                      }
                                      navigate(`/chat/${psychic._id}`);
                                    }}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    Credits {psychic.rate?.perMinute?.toFixed(2) || "1.75"}/min
                                  </Button>
                                 <Button 
    variant="outline" 
    className="rounded-full gap-2"
    onClick={() => navigate(`/psychic/${psychic._id}`)}
  >
    View Profile
  </Button>
                                  <Button variant="ghost" size="icon">
                                    <Mail className="h-5 w-5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}

                    {showing < psychics.length && (
                      <div className="flex justify-center mt-4">
                        <Button onClick={handleShowMore} variant="brand">
                          Show More
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <ProfileSection />
          </div>
        </div>
      </div>
    </>
  );
}