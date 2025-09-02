import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../screen/AuthContext";
import { Link } from "react-router-dom";

export default function DashboardAccordions() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    image: "",
    credits: 0,
    payments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user._id) {
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/users/user/${user._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        if (res.data.success) {
          setUserData({
            username: res.data.user.username || res.data.user.name || "",
            email: res.data.user.email || "",
            image: res.data.user.image || "",
            credits: res.data.user.credits || 0,
            payments: res.data.user.payments || [],
          });
        } else {
          throw new Error(res.data.message || "Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        toast.error(err.message || "Failed to fetch user data");
        // Fallback to auth context user
        setUserData({
          username: user.username || user.name || "",
          email: user.email || "",
          image: user.image || "",
          credits: 0,
          payments: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm rounded-sm border border-gray-200">
      <Accordion type="single" collapsible defaultValue="settings">
        <AccordionItem value="settings" className="border-0">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-slate-800">Settings</h2>
            </div>
          </div>

          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-slate-800 mb-1">Personal Information</h3>
                {userData.username || userData.email ? (
                  <div className="text-sm text-slate-700 space-y-1">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={userData.image || "/default-avatar.png"}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                      />
                    </div>
                    <p><span className="font-medium">Username:</span> {userData.username}</p>
                    <p><span className="font-medium">Email:</span> {userData.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">User info not available</p>
                )}
                <button className="mt-4 text-sm text-[#3B5EB7] hover:text-[#2c5ace] font-medium">
                  <Link to="/update-profile">Edit</Link>
                </button>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-slate-800 mb-1">Credits</h3>
                {userData.credits > 0 ? (
                  <div className="text-sm text-slate-700 space-y-1">
                    <p><span className="font-medium">Balance:</span> {userData.credits} Credits</p>
                    <p className="text-sm text-slate-500">Use credits for premium consultations.</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No credits available</p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-slate-800 mb-1">Payment Details</h3>
                {userData.payments.length > 0 ? (
                  <div className="text-sm text-slate-700">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userData.payments.map((payment, index) => (
                          <TableRow key={payment.molliePaymentId || index}>
                            <TableCell>{formatDate(payment.createdAt)}</TableCell>
                            <TableCell>{payment.planName || "N/A"}</TableCell>
                            <TableCell>€{payment.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No payment history available</p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}