import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for redirect
import Navigation from "./Navigator";
import { ProfileSection } from "./Short_COmponents/Profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useAuth } from "./screen/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const My_Consultations = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Added for redirect
  const [chatDetails, setChatDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("ChatDetails.jsx - User:", user); // Debug user state
    console.log("Token from user:", user?.token); // Debug user token
    console.log("Token from localStorage:", localStorage.getItem("token")); // Debug localStorage token

    if (!user || !user._id) {
      toast.error("Please log in to view chat details");
      navigate("/login"); // Redirect to login
      setLoading(false);
      return;
    }

    const fetchChatDetails = async () => {
      setLoading(true);
      try {
        const token = user.token || localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/chat/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response:", res.data); // Debug API response
        if (!res.data.success) {
          throw new Error(res.data.error || "Failed to fetch chat details");
        }
        setChatDetails(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch chat details:", err);
        toast.error(err.response?.data?.error || "Failed to fetch chat details");
        setChatDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatDetails();
  }, [user, navigate]);

  return (
    <div className="px-2 sm:px-4 min-h-screen">
      <div className="max-w-7xl mx-auto pb-10">
        <Navigation />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            <Card className="w-full rounded-sm shadow-sm border border-gray-200">
              <CardHeader className="border-b bg-white">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold">Chat Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-2 sm:p-4">
                <Table>
                  <TableCaption>A list of your chat history.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Psychic Name</TableHead>
                      <TableHead>Total Sessions</TableHead>
                      <TableHead className="text-right">Credits Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : chatDetails.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No chat details found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      chatDetails.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{detail.username}</TableCell>
                          <TableCell>{detail.psychicName}</TableCell>
                          <TableCell>{detail.totalSessions}</TableCell>
                          <TableCell className="text-right">{detail.totalCreditsUsed}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 max-lg:hidden">
            <ProfileSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default My_Consultations;