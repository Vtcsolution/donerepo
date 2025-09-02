import { useEffect, useState } from "react";
import { useAuth } from "@/All_Components/screen/AuthContext";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";
import { useNavigate } from "react-router-dom";
import Navigation from "@/All_Components/Navigator";

const AstrologyReportTable = () => {
  const { user } = useAuth();
  const [savedReports, setSavedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedReports = async () => {
      if (!user) {
        toast.error("Please log in to view your reports.");
        return;
      }
      setIsLoading(true);
      setErrorMessage("");
      try {
        const token = localStorage.getItem("accessToken");
        // Fetch text-based reports
        const textResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/reports?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(error => {
          console.error("Failed to fetch text reports:", error);
          return { data: { success: false, data: [] } }; // Return empty data on failure
        });

        // Fetch PDF reports
        const pdfResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/pdf-astrology-reports?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(error => {
          console.error("Failed to fetch PDF reports:", error);
          return { data: { success: false, data: [] } }; // Return empty data on failure
        });

        const textReports = textResponse.data.success
          ? textResponse.data.data.map((report) => ({ ...report, type: "Text" }))
          : [];
        const pdfReports = pdfResponse.data.success
          ? pdfResponse.data.data.map((report) => ({ ...report, type: "PDF" }))
          : [];

        // Combine and sort reports by createdAt (descending)
        const combinedReports = [...textReports, ...pdfReports].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setSavedReports((prev) => (page === 1 ? combinedReports : [...prev, ...combinedReports]));
        setHasMore(textResponse.data.data.length === limit || pdfResponse.data.data.length === limit);

        // Set error message only if both requests fail
        if (!textResponse.data.success && !pdfResponse.data.success) {
          setErrorMessage("An error occurred while fetching reports.");
        } else if (!textResponse.data.success) {
          setErrorMessage("Failed to fetch text reports.");
        } else if (!pdfResponse.data.success) {
          setErrorMessage("Failed to fetch PDF reports.");
        }
      } catch (error) {
        console.error("Unexpected error while fetching reports:", error);
        setErrorMessage(error.response?.data?.message || "An unexpected error occurred.");
        toast.error("An unexpected error occurred while fetching reports.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedReports();
  }, [user, page]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const renderReportsTable = () => {
    if (isLoading && page === 1) {
      return (
        <div className="flex justify-center p-4 sm:p-8">
          <LoadingSpinner />
        </div>
      );
    }

    if (savedReports.length === 0 && !isLoading) {
      return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-xl dark:bg-slate-950 border border-purple-200 dark:border-purple-900">
          <h2 className="text-xl sm:text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-4">No Reports Available</h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            You haven't generated any astrology reports yet.{" "}
            <a href="/astrology-report" className="text-purple-600 dark:text-purple-400 hover:underline">
              Generate your first report now!
            </a>
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-xl dark:bg-slate-950 border border-purple-200 dark:border-purple-900">
        <h2 className="text-xl sm:text-2xl font-sans font-semibold text-gray-900 dark:text-white mb-6">Your Astrology Reports</h2>
       
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-900">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-white min-w-[100px]">Type</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-white min-w-[120px]">Moon</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-white min-w-[120px]">Created Date</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-white min-w-[150px]">Report ID</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-white min-w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {savedReports.map((report, index) => (
                <tr
                  key={report._id}
                  className={`border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white dark:bg-slate-950" : "bg-gray-50 dark:bg-slate-900"
                  }`}
                >
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{report.type}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm truncate">
                    {report.type === "Text" ? report.chart?.moon?.sign || "Unknown" : "-"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "Unknown"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 text-xs sm:text-sm truncate">{report._id}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    {report.type === "Text" ? (
                      <Button
                        onClick={() => navigate(`/astrology-report/${report._id}`)}
                        variant="brand"
                        className="rounded-full bg-[#3B5EB7] hover:bg-[#2F4A94] text-white text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4 shadow-md transition-all duration-200 w-full sm:w-auto"
                      >
                        View Report
                      </Button>
                    ) : (
                      <Button
                        onClick={() => window.open(report.pdfUrl, "_blank")}
                        variant="brand"
                        className="rounded-full bg-[#6B48FF] hover:bg-[#5B38CC] text-white text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4 shadow-md transition-all duration-200 w-full sm:w-auto"
                      >
                        Download PDF
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="mt-6 sm:mt-8 text-center">
            <Button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={`rounded-full bg-[#3B5EB7] hover:bg-[#2F4A94] text-white text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-6 shadow-md transition-all duration-200 w-full sm:w-auto ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? <LoadingSpinner className="w-5 h-5 sm:w-6 sm:h-6 inline-block" /> : "Load More Reports"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950">
      <Navigation />
      <div className="pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12">
            Your Astrology Reports
          </h1>
          {renderReportsTable()}
        </div>
      </div>
    </div>
  );
};

export default AstrologyReportTable;