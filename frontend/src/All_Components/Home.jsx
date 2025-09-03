import { MessageCircle, Star, Lock, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProfileSection1 } from "./Short_COmponents/Profiles";
import { toast } from "sonner";
import { parse, isValid, isBefore, isLeapYear } from "date-fns";
import { useAuth } from "./screen/AuthContext";

const Home = () => {
  const { user, loading: authLoading, error: authError, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [psychics, setPsychics] = useState([]);
  const [showing, setShowing] = useState(4);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [numerologyReport, setNumerologyReport] = useState(null);
  const [astrologyReport, setAstrologyReport] = useState(null);
  const [loveCompatibilityReport, setLoveCompatibilityReport] = useState(null);
  const [monthlyForecastReport, setMonthlyForecastReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [modalType, setModalType] = useState(null);
  const [pdfReport, setPdfReport] = useState(null);
  const [lovePdfReport, setLovePdfReport] = useState(null);
  const [formData, setFormData] = useState({
    yourFirstName: "",
    yourLastName: "",
    yourBirthDate: "",
    yourBirthTime: "",
    yourBirthPlace: "",
    partnerFirstName: "",
    partnerLastName: "",
    partnerBirthDate: "",
    partnerBirthTime: "",
    partnerPlaceOfBirth: "",
  });
  const [isLoadingPsychics, setIsLoadingPsychics] = useState(false);
  const [psychicsError, setPsychicsError] = useState(null);

  // Fetch psychics data
  useEffect(() => {
    const fetchPsychics = async () => {
      setIsLoadingPsychics(true);
      setPsychicsError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/psychics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });
        const data = response.data;
        if (data.success && Array.isArray(data.data)) {
          setPsychics(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch psychics");
        }
      } catch (error) {
        console.error("Error fetching psychics:", error);
        setPsychicsError(error.response?.data?.message || "Failed to load psychic profiles. Please try again.");
        toast.error(error.response?.data?.message || "Failed to load psychic profiles.");
      } finally {
        setIsLoadingPsychics(false);
      }
    };
    fetchPsychics();
  }, []);

  // Fetch user data if not present after navigation
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user && (localStorage.getItem("accessToken") || location.state?.fromLogin)) {
        console.log("No user or from login, fetching user data");
        try {
          const token = localStorage.getItem("accessToken");
          const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          console.log("Fetched user data:", data.user);
          setUser(data.user);
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          localStorage.removeItem("accessToken");
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        }
      }
    };
    fetchUserData();
  }, [user, navigate, setUser, location.state?.fromLogin]);

  // Update formData when user changes
  useEffect(() => {
    if (user && (selectedPsychic?.type.toLowerCase() !== "tarot" || modalType === "lovePdf")) {
      console.log("User changed, updating formData:", user);
      const birthDate = user.dob ? new Date(user.dob).toISOString().split("T")[0] : "";
      setFormData((prev) => ({
        ...prev,
        yourFirstName: user.username || "",
        yourLastName: "",
        yourBirthDate: birthDate,
        yourBirthTime: user.birthTime || "",
        yourBirthPlace: user.birthPlace || "",
      }));
      console.log("Auto-filled formData:", {
        yourFirstName: user.username || "",
        yourLastName: "",
        yourBirthDate: birthDate,
        yourBirthTime: user.birthTime || "",
        yourBirthPlace: user.birthPlace || "",
      });
      if (!birthDate || !user.birthPlace) {
        toast.warning("Some profile details are missing. Please complete your profile in the dashboard for a seamless experience.");
      }
    }
  }, [user, selectedPsychic, modalType]);

  // Handle reports from navigation state
  useEffect(() => {
    if (location.state?.numerologyReport) {
      setNumerologyReport(location.state.numerologyReport);
      setShowReportModal(true);
      navigate("/", { state: {}, replace: true });
    } else if (location.state?.astrologyReport) {
      setAstrologyReport(location.state.astrologyReport);
      setShowReportModal(true);
      navigate("/", { state: {}, replace: true });
    } else if (location.state?.monthlyForecastReport) {
      setMonthlyForecastReport(location.state.monthlyForecastReport);
      setShowReportModal(true);
      navigate("/", { state: {}, replace: true });
    } else if (location.state?.loveCompatibilityReport) {
      setLoveCompatibilityReport(location.state.loveCompatibilityReport);
      setShowReportModal(true);
      navigate("/", { state: {}, replace: true });
    }
  }, [location.state, navigate]);

  // Fetch user credits
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          toast.error("Authentication token missing. Please log in again.");
          navigate("/login");
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserCredits(response.data.credits || 0);
      } catch (error) {
        console.error("Failed to fetch user credits:", error);
      }
    };
    fetchUserCredits();
  }, [user, navigate]);

  // Fetch PDF Astrology report if exists
  useEffect(() => {
    const fetchPdfReport = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/pdf-astrology-reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        if (data.success && data.data.length > 0) {
          setPdfReport(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching PDF Astrology report:", error);
      }
    };
    fetchPdfReport();
  }, [user]);

  // Fetch Love PDF report if exists
  useEffect(() => {
    const fetchLovePdfReport = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/love-pdf-reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        if (data.success && data.data.length > 0) {
          setLovePdfReport(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching Love PDF report:", error);
      }
    };
    fetchLovePdfReport();
  }, [user]);

  // Geocode birth place for Astrology, Love, and Love PDF readings
  useEffect(() => {
    const fetchCoords = async (field, city) => {
      if (!city) return;
      try {
        setIsGeocoding(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/geocode?city=${encodeURIComponent(city)}`
        );
        const { latitude, longitude } = response.data;
        setFormData((prev) => ({
          ...prev,
          ...(field === "your" ? { yourLatitude: latitude, yourLongitude: longitude } : {}),
          ...(field === "partner" ? { partnerLatitude: latitude, partnerLongitude: longitude } : {}),
        }));
      } catch (err) {
        console.error(`Geocode failed for "${city}"`, err);
        toast.error(`Failed to fetch coordinates for ${field === "your" ? "your" : "partner's"} birth place. Please enter a valid city and country (e.g., Amsterdam, Netherlands).`);
      } finally {
        setIsGeocoding(false);
      }
    };

    if (selectedPsychic?.type === "Astrology" || selectedPsychic?.type === "Love" || modalType === "lovePdf") {
      if (formData.yourBirthPlace) fetchCoords("your", formData.yourBirthPlace);
      if (formData.partnerPlaceOfBirth) fetchCoords("partner", formData.partnerPlaceOfBirth);
    }
  }, [formData.yourBirthPlace, formData.partnerPlaceOfBirth, selectedPsychic?.type, modalType]);

  const handleAstrologyUnlock = () => {
    if (!user) {
      toast.error("Please log in to unlock the astrology report");
      navigate("/login");
      return;
    }
    setModalType("astrology");
    setShowConfirmModal(true);
  };

  const handleLoveCompatibilityUnlock = () => {
    if (!user) {
      toast.error("Please log in to unlock the love compatibility report");
      navigate("/login");
      return;
    }
    setModalType("loveCompatibility");
    setShowReportModal(true);
  };

  const handleMonthlyForecastUnlock = () => {
    if (!user) {
      toast.error("Please log in to unlock the monthly forecast");
      navigate("/login");
      return;
    }
    setModalType("monthlyForecast");
    setShowConfirmModal(true);
  };

  const handlePdfUnlock = async () => {
    if (!user) {
      toast.error("Please log in to unlock the PDF Astrology report");
      navigate("/login");
      return;
    }
    if (!user.gender) {
      toast.error("Please update your profile with your gender to unlock the PDF report.");
      navigate("/profile");
      return;
    }
    if (!user.username || !user.dob || !user.birthTime || !user.birthPlace) {
      toast.error("Please complete your profile with username, date of birth, birth time, and birth place.");
      navigate("/profile");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/generate-pdf-astrology-report`,
        { gender: user.gender.toLowerCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      if (data.success) {
        setPdfReport(data.data);
        setUserCredits(data.credits);
        toast.success("PDF Astrology Report generated successfully!");
      } else {
        if (data.message.includes("Insufficient credits")) {
          setModalType("pdfAstrology");
          setShowPaymentModal(true);
        } else {
          toast.error(data.message || "Failed to generate PDF Astrology Report.");
        }
      }
    } catch (error) {
      console.error("PDF Astrology Generation Error:", error);
      toast.error(error.response?.data?.message || "Error generating PDF Astrology Report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLovePdfUnlock = async () => {
    if (!user) {
      toast.error("Please log in to unlock the Love PDF report");
      navigate("/login");
      return;
    }
    if (!user.username || !user.dob || !user.birthTime || !user.birthPlace) {
      toast.error("Please complete your profile with username, date of birth, birth time, and birth place.");
      navigate("/profile");
      return;
    }
    setModalType("lovePdf");
    setShowReportModal(true);
  };

  const handleLovePdfSubmit = async () => {
    if (!user) {
      toast.error("Please log in to proceed.");
      navigate("/login");
      return;
    }

    const requiredFields = [
      "yourFirstName",
      "yourBirthDate",
      "yourBirthPlace",
      "partnerFirstName",
      "partnerLastName",
      "partnerBirthDate",
      "partnerPlaceOfBirth",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]?.trim());
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields
        .map((field) => field.replace(/([A-Z])/g, " $1").toLowerCase())
        .join(", ")}`);
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.yourBirthDate) || !dateRegex.test(formData.partnerBirthDate)) {
      toast.error("Invalid birth date format. Please use YYYY-MM-DD.");
      return;
    }

    const nameRegex = /^[a-zA-Z\s]*$/;
    if (!nameRegex.test(formData.yourFirstName)) {
      toast.error("Your first name must contain only letters and spaces.");
      return;
    }
    if (!nameRegex.test(formData.partnerFirstName) || !nameRegex.test(formData.partnerLastName)) {
      toast.error("Partner's first and last names must contain only letters and spaces.");
      return;
    }

    const userDate = parse(formData.yourBirthDate, "yyyy-MM-dd", new Date());
    const partnerDate = parse(formData.partnerBirthDate, "yyyy-MM-dd", new Date());
    if (!isValid(userDate) || !isBefore(userDate, new Date()) || !isValid(partnerDate) || !isBefore(partnerDate, new Date())) {
      toast.error("Birth dates must be valid and in the past.");
      return;
    }

    if (formData.yourBirthPlace && !formData.yourLatitude) {
      toast.error("Please wait for geocoding to complete or enter a valid birth place.");
      return;
    }
    if (formData.partnerPlaceOfBirth && !formData.partnerLatitude) {
      toast.error("Please wait for geocoding to complete for partner's birth place.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/generate-love-pdf-report`,
        {
          yourFirstName: formData.yourFirstName,
          yourBirthDate: formData.yourBirthDate,
          yourBirthTime: formData.yourBirthTime || "",
          yourBirthPlace: formData.yourBirthPlace,
          yourLatitude: Number(formData.yourLatitude) || null,
          yourLongitude: Number(formData.yourLongitude) || null,
          partnerFirstName: formData.partnerFirstName,
          partnerLastName: formData.partnerLastName,
          partnerBirthDate: formData.partnerBirthDate,
          partnerBirthTime: formData.partnerBirthTime || "",
          partnerPlaceOfBirth: formData.partnerPlaceOfBirth,
          partnerLatitude: Number(formData.partnerLatitude) || null,
          partnerLongitude: Number(formData.partnerLongitude) || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setLovePdfReport(response.data.data);
        setUserCredits(response.data.credits);
        toast.success("Love PDF Report generated successfully!");
        setShowReportModal(false);
      } else {
        if (response.data.message.includes("Insufficient credits")) {
          setModalType("lovePdf");
          setShowPaymentModal(true);
        } else {
          toast.error(response.data.message || "Failed to generate Love PDF Report.");
        }
      }
    } catch (error) {
      console.error("Love PDF Generation Error:", error);
      toast.error(error.response?.data?.message || "Error generating Love PDF Report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmUnlock = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        navigate("/login");
        return;
      }

      let endpoint, creditCost, setReport, navigatePath;
      let payload = {
        yourName: user.username || "",
        birthDate: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        birthTime: user.birthTime || "",
        birthPlace: user.birthPlace || "",
      };

      if (modalType === "astrology") {
        endpoint = `${import.meta.env.VITE_BASE_URL}/api/astrology-report`;
        creditCost = 5;
        setReport = setAstrologyReport;
        navigatePath = "/astrology-report";
      } else if (modalType === "monthlyForecast") {
        endpoint = `${import.meta.env.VITE_BASE_URL}/api/monthly-forecast`;
        creditCost = 5;
        setReport = setMonthlyForecastReport;
        navigatePath = "/monthly-forecast";
      } else {
        throw new Error("Invalid report type");
      }

      if (modalType === "astrology") {
        payload = {
          ...payload,
          ...(formData.yourLatitude && { latitude: Number(formData.yourLatitude) }),
          ...(formData.yourLongitude && { longitude: Number(formData.yourLongitude) }),
        };
      }

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setNumerologyReport(null);
        setAstrologyReport(null);
        setLoveCompatibilityReport(null);
        setMonthlyForecastReport(null);
        setReport(response.data.data);
        setUserCredits(response.data.credits);
        toast.success(`${modalType === "astrology" ? "Astrology" : "Monthly Forecast"} report unlocked successfully!`);
        navigate(navigatePath, { state: { [modalType + "Report"]: response.data.data } });
      } else {
        if (response.data.message === "Insufficient credits") {
          setModalType(modalType);
          setShowPaymentModal(true);
        } else if (response.data.message.includes("Invalid birth place")) {
          toast.error("Invalid birth place provided. Please update your profile with a valid city and country (e.g., Amsterdam, Netherlands).");
          navigate("/dashboard");
        } else {
          toast.error(response.data.message || `Failed to generate ${modalType} report`);
        }
      }
    } catch (error) {
      console.error(`Error generating ${modalType} report:`, error);
      toast.error(error.response?.data?.message || `An error occurred while generating the ${modalType} report`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentRedirect = () => {
    navigate("/payment");
    setShowPaymentModal(false);
  };

  const handleShowMore = () => setShowing((prev) => Math.min(prev + 4, psychics.length));

  const handlePsychicSelect = async (psychic) => {
    console.log("handlePsychicSelect called with psychic:", psychic._id, psychic.type);
    console.log("Current user data:", user);

    if (!user) {
      console.log("No user, redirecting to /login");
      toast.error("Please log in to connect with a psychic");
      navigate("/login");
      return;
    }

    setSelectedPsychic(psychic);
    const type = psychic.type.toLowerCase();
    console.log("Psychic type:", type);

    if (type === "tarot") {
      console.log("Tarot selected, initiating chat directly");
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.log("No token, redirecting to /login");
          toast.error("Authentication token missing. Please log in again.");
          navigate("/login");
          return;
        }

        const payload = {
          psychicId: psychic._id,
          formData: {},
        };

        console.log("Submitting tarot payload:", payload);

        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/form/submit`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          console.log("Tarot submission successful, navigating to /chat/", psychic._id);
          toast.success("Tarot reading initiated successfully!");
          navigate(`/chat/${psychic._id}`);
        } else {
          console.error("Backend error:", response.data.message);
          toast.error(response.data.message || "Failed to initiate Tarot reading.");
        }
      } catch (error) {
        console.error("Tarot submission error:", error.response?.data || error);
        toast.error(error.response?.data?.message || "An error occurred while initiating the Tarot reading.");
      } finally {
        setIsSubmitting(false);
      }
    } else if (type === "profile") {
      console.log("Profile selected, navigating to psychic profile");
      navigate(`/psychic/${psychic._id}`);
    } else {
      setShowReportModal(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("Name")) {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (value && !nameRegex.test(value)) {
        toast.error(`${name.includes("your") ? "Your" : "Partner's"} ${name.includes("First") ? "first name" : "last name"} must contain only letters and spaces.`);
        return;
      }
    }

    if (name.includes("BirthDate")) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (value && !dateRegex.test(value)) {
        toast.error(`Invalid date format for ${name.includes("your") ? "Your" : "Partner's"} Birth Date. Use YYYY-MM-DD.`);
        return;
      }
      const date = parse(value, "yyyy-MM-dd", new Date());
      if (value && (!isValid(date) || !isBefore(date, new Date()))) {
        toast.error(`${name.includes("your") ? "Your" : "Partner's"} Birth Date must be in the past.`);
        return;
      }
      const [year, month, day] = value.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth || (month === 2 && day === 29 && !isLeapYear(year))) {
        toast.error(`Invalid day for ${name.includes("your") ? "Your" : "Partner's"} Birth Date. Check leap year or days in month.`);
        return;
      }
    }

    if (name.includes("BirthTime")) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (value && !timeRegex.test(value)) {
        toast.error(`Invalid time format for ${name.includes("your") ? "Your" : "Partner's"} Birth Time. Use HH:MM (24-hour).`);
        return;
      }
    }

    if (name.includes("BirthPlace")) {
      if (value && !value.includes(",")) {
        toast.warning(`Please include city and country for ${name.includes("your") ? "Your" : "Partner's"} Birth Place (e.g., 'Amsterdam, Netherlands').`);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleFormSubmit = async () => {
    if (!selectedPsychic || !user) {
      console.log("Form submission blocked: missing psychic or user");
      toast.error("Please select a psychic and ensure you are logged in.");
      return;
    }

    const type = selectedPsychic.type.toLowerCase();
    console.log("Submitting form for type:", type, "with formData:", formData);

    const requiredFields = {
      astrology: ["yourFirstName", "yourBirthDate", "yourBirthPlace"],
      love: [
        "yourFirstName",
        "yourBirthDate",
        "yourBirthPlace",
        "partnerFirstName",
        "partnerLastName",
        "partnerBirthDate",
        "partnerPlaceOfBirth",
      ],
      numerology: ["yourFirstName", "yourBirthDate"],
      tarot: [],
    }[type] || [];

    if (type !== "tarot") {
      const missingFields = requiredFields.filter((field) => !formData[field]?.trim());
      if (missingFields.length > 0) {
        console.log("Missing fields:", missingFields);
        toast.error(`Missing required fields: ${missingFields
          .map((field) => field.replace(/([A-Z])/g, " $1").toLowerCase())
          .join(", ")}`);
        return;
      }

      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(formData.yourFirstName)) {
        console.log("Invalid yourFirstName format");
        toast.error("Your first name must contain only letters and spaces.");
        return;
      }
      if (type === "astrology" && formData.yourLastName && !nameRegex.test(formData.yourLastName)) {
        console.log("Invalid yourLastName format");
        toast.error("Your last name must contain only letters and spaces.");
        return;
      }
      if (type === "love" && (!nameRegex.test(formData.partnerFirstName) || !nameRegex.test(formData.partnerLastName))) {
        console.log("Invalid partnerFirstName or partnerLastName format");
        toast.error("Partner's first and last names must contain only letters and spaces.");
        return;
      }

      if (type === "astrology" || type === "love") {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(formData.yourBirthDate) || (type === "love" && !dateRegex.test(formData.partnerBirthDate))) {
          console.log("Invalid birth date format");
          toast.error("Invalid birth date format. Please use YYYY-MM-DD.");
          return;
        }

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (formData.yourBirthTime && !timeRegex.test(formData.yourBirthTime)) {
          console.log("Invalid yourBirthTime format");
          toast.error("Invalid time format for Your Birth Time. Please use HH:MM (24-hour).");
          return;
        }
        if (type === "love" && formData.partnerBirthTime && !timeRegex.test(formData.partnerBirthTime)) {
          console.log("Invalid partnerBirthTime format");
          toast.error("Invalid time format for Partner's Birth Time. Please use HH:MM (24-hour).");
          return;
        }

        const userDate = parse(formData.yourBirthDate, "yyyy-MM-dd", new Date());
        if (!isValid(userDate) || !isBefore(userDate, new Date())) {
          console.log("Invalid yourBirthDate");
          toast.error("Your Birth Date must be valid and in the past.");
          return;
        }

        if (type === "love") {
          const partnerDate = parse(formData.partnerBirthDate, "yyyy-MM-dd", new Date());
          if (!isValid(partnerDate) || !isBefore(partnerDate, new Date())) {
            console.log("Invalid partnerBirthDate");
            toast.error("Partner's Birth Date must be valid and in the past.");
            return;
          }
        }

        if (formData.yourBirthPlace && !formData.yourLatitude) {
          console.log("Geocoding incomplete for yourBirthPlace");
          toast.error("Please wait for geocoding to complete or enter a valid birth place.");
          return;
        }
        if (type === "love" && formData.partnerPlaceOfBirth && !formData.partnerLatitude) {
          console.log("Geocoding incomplete for partnerPlaceOfBirth");
          toast.error("Please wait for geocoding to complete for partner's birth place.");
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("No token, redirecting to /login");
        toast.error("Authentication token missing. Please log in again.");
        navigate("/login");
        return;
      }

      const payload = {
        psychicId: selectedPsychic._id,
        formData: {
          ...(type === "astrology" && {
            yourName: `${formData.yourFirstName} ${formData.yourLastName || ""}`.trim(),
            birthDate: formData.yourBirthDate,
            birthTime: formData.yourBirthTime,
            birthPlace: formData.yourBirthPlace,
            latitude: Number(formData.yourLatitude) || null,
            longitude: Number(formData.yourLongitude) || null,
          }),
          ...(type === "numerology" && {
            yourName: formData.yourFirstName.trim(),
            birthDate: formData.yourBirthDate,
          }),
          ...(type === "love" && {
            yourName: `${formData.yourFirstName} ${formData.yourLastName || ""}`.trim(),
            yourBirthDate: formData.yourBirthDate,
            yourBirthTime: formData.yourBirthTime,
            yourBirthPlace: formData.yourBirthPlace,
            yourLatitude: Number(formData.yourLatitude) || null,
            yourLongitude: Number(formData.yourLongitude) || null,
            partnerName: `${formData.partnerFirstName} ${formData.partnerLastName}`.trim(),
            partnerBirthDate: formData.partnerBirthDate,
            partnerBirthTime: formData.partnerBirthTime,
            partnerPlaceOfBirth: formData.partnerPlaceOfBirth,
            partnerLatitude: Number(formData.partnerLatitude) || null,
            partnerLongitude: Number(formData.partnerLongitude) || null,
          }),
          ...(type === "tarot" && {}),
        },
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/form/submit`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("Form submission successful, navigating to /chat/", selectedPsychic._id);
        toast.success(`${selectedPsychic.type} reading data saved successfully!`);
        setShowReportModal(false);
        navigate(`/chat/${selectedPsychic._id}`);
      } else {
        console.error("Backend error:", response.data.message);
        toast.error(response.data.message || "Failed to save reading data.");
      }
    } catch (error) {
      console.error("Submission error:", error.response?.data || error);
      if (error.response?.data?.message?.includes("Invalid birth place")) {
        toast.error("Invalid birth place provided. Please enter a valid city and country (e.g., Amsterdam, Netherlands).");
      } else if (error.response?.data?.message?.includes("Missing required fields")) {
        toast.error(`Missing required fields: ${error.response.data.message.split(":")[1] || "please check your input."}`);
      } else {
        toast.error(error.response?.data?.message || "An error occurred while saving the reading data.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = () => {
    if (!selectedPsychic && modalType !== "lovePdf" && modalType !== "loveCompatibility") return null;
    const type = selectedPsychic?.type?.toLowerCase() || modalType;
    const commonInput = (label, name, type = "text", placeholder = "", required = false) => (
      <div className="space-y-2">
        <Label>{label}{required ? " *" : ""}</Label>
        <Input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="rounded-md border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300"
        />
      </div>
    );

    switch (type) {
      case "numerology":
        return (
          <>
            {commonInput("Your First Name", "yourFirstName", "text", "Your first name", true)}
            {commonInput("Date of Birth", "yourBirthDate", "date", "", true)}
          </>
        );
      case "love":
      case "loveCompatibility":
      case "lovePdf":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              {commonInput("Your First Name", "yourFirstName", "text", "Your first name", true)}
              {commonInput("Your Last Name", "yourLastName", "text", "Your last name", false)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {commonInput("Your Date of Birth", "yourBirthDate", "date", "", true)}
              {commonInput("Your Time of Birth", "yourBirthTime", "time", "", false)}
            </div>
            {commonInput("Your Place of Birth", "yourBirthPlace", "text", "City, Country", true)}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-4">Partner Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {commonInput("Partner's First Name", "partnerFirstName", "text", "Partner's first name", true)}
                {commonInput("Partner's Last Name", "partnerLastName", "text", "Partner's last name", true)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {commonInput("Partner's Date of Birth", "partnerBirthDate", "date", "", true)}
                {commonInput("Partner's Time of Birth", "partnerBirthTime", "time", "", false)}
              </div>
              {commonInput("Partner's Place of Birth", "partnerPlaceOfBirth", "text", "City, Country", true)}
            </div>
          </>
        );
      case "astrology":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              {commonInput("Your First Name", "yourFirstName", "text", "Your first name", true)}
              {commonInput("Your Last Name", "yourLastName", "text", "Your last name", false)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {commonInput("Your Date of Birth", "yourBirthDate", "date", "", true)}
              {commonInput("Your Time of Birth", "yourBirthTime", "time", "", false)}
            </div>
            {commonInput("Your Place of Birth", "yourBirthPlace", "text", "City, Country", true)}
          </>
        );
      case "tarot":
        return (
          <p className="text-gray-600 dark:text-gray-300">
            No additional information is required for your Tarot reading. Click "Start Reading" to begin your session.
          </p>
        );
      default:
        return null;
    }
  };

  const renderNumerologyReport = () => {
    if (!numerologyReport) return null;
    const { narrative, lifePath, expression, soulUrge, personality, karmicLessons, challenges } = numerologyReport;
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-semibold text-center">Your Numerology Blueprint</h2>
        <div className="prose max-w-none">
          <p className="whitespace-pre-line text-gray-700">{narrative}</p>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Life Path Number: {lifePath.number}</h3>
            <p className="text-gray-600">{lifePath.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Expression Number: {expression.number}</h3>
            <p className="text-gray-600">{expression.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Heart’s Desire Number: {soulUrge.number}</h3>
            <p className="text-gray-600">{soulUrge.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Personality Number: {personality.number}</h3>
            <p className="text-gray-600">{personality.description}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Karmic Lessons: {karmicLessons.length > 0 ? karmicLessons.join(", ") : "None"}</h3>
            <p className="text-gray-600">
              {karmicLessons.length > 0
                ? "These numbers represent lessons to learn in this lifetime, derived from missing letters in your name."
                : "You have no missing numbers, indicating a balanced set of energies."}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Challenges: {challenges.join(", ")}</h3>
            <p className="text-gray-600">
              These numbers represent challenges you may face, calculated from your birth date.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button variant="brand" onClick={handleAstrologyUnlock} disabled={isSubmitting}>
            Unlock Astrology Report (5 Credits)
          </Button>
          <Button
            onClick={() => {
              setShowReportModal(false);
              navigate("/chat/free");
            }}
            variant="outline"
            className="w-full sm:flex-1"
          >
            Chat 1 Minute Free with a Coach
          </Button>
        </div>
      </div>
    );
  };

  const renderAstrologyReport = () => {
    if (!astrologyReport) return null;
    const { narrative, chart, numerology } = astrologyReport;
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-semibold text-center">Your Astrological Blueprint</h2>
        {isSubmitting ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-700">{narrative}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Sun Sign: {chart.sun.sign} (House {chart.sun.house})</h3>
                <p className="text-gray-600">{chart.sun.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Moon Sign: {chart.moon.sign} (House {chart.moon.house})</h3>
                <p className="text-gray-600">{chart.moon.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Venus Sign: {chart.venus.sign} (House {chart.venus.house})</h3>
                <p className="text-gray-600">{chart.venus.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Mars Sign: {chart.mars.sign} (House {chart.mars.house})</h3>
                <p className="text-gray-600">{chart.mars.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Mercury Sign: {chart.mercury.sign} (House {chart.mercury.house})</h3>
                <p className="text-gray-600">{chart.mercury.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Jupiter Sign: {chart.jupiter.sign} (House {chart.jupiter.house})</h3>
                <p className="text-gray-600">{chart.jupiter.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Saturn Sign: {chart.saturn.sign} (House {chart.saturn.house})</h3>
                <p className="text-gray-600">{chart.saturn.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Life Path Number: {numerology.lifePath.number}</h3>
                <p className="text-gray-600">{numerology.lifePath.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Heart’s Desire Number: {numerology.heart.number}</h3>
                <p className="text-gray-600">{numerology.heart.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Expression Number: {numerology.expression.number}</h3>
                <p className="text-gray-600">{numerology.expression.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Personality Number: {numerology.personality.number}</h3>
                <p className="text-gray-600">{numerology.personality.description}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={() => {
                  setShowReportModal(false);
                  setAstrologyReport(null);
                  navigate("/astrology-report", { state: { astrologyReport } });
                }}
                variant="outline"
                className="w-full sm:flex-1"
              >
                View Full Report
              </Button>
              <Button
                onClick={() => {
                  setShowReportModal(false);
                  setAstrologyReport(null);
                  navigate("/");
                }}
                variant="outline"
                className="w-full sm:flex-1"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderLoveCompatibilityReport = () => {
    if (!loveCompatibilityReport) return null;
    const { narrative, compatibility } = loveCompatibilityReport;
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-semibold text-center">Your Love Compatibility Report</h2>
        {isSubmitting ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-700">{narrative}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Compatibility Score: {compatibility.score}</h3>
                <p className="text-gray-600">{compatibility.description}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={() => {
                  setShowReportModal(false);
                  setLoveCompatibilityReport(null);
                  navigate("/love-compatibility", { state: { loveCompatibilityReport } });
                }}
                variant="outline"
                className="w-full sm:flex-1"
              >
                View Full Report
              </Button>
              <Button
                onClick={() => {
                  setShowReportModal(false);
                  setLoveCompatibilityReport(null);
                  navigate("/");
                }}
                variant="outline"
                className="w-full sm:flex-1"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMonthlyForecastReport = () => {
    if (!monthlyForecastReport) return null;
    const { narrative, chart, forecast, predictionMonth, predictionYear } = monthlyForecastReport;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-semibold text-center">Your Monthly Forecast for {monthNames[predictionMonth - 1]} {predictionYear}</h2>
        {isSubmitting ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-700">{narrative}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Overview</h3>
                <p className="text-gray-600">{forecast.overview}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Career & Purpose</h3>
                <p className="text-gray-600">{forecast.career}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Relationships & Connections</h3>
                <p className="text-gray-600">{forecast.relationships}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Personal Growth & Spirituality</h3>
                <p className="text-gray-600">{forecast.personalGrowth}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Challenges & Practical Advice</h3>
                <p className="text-gray-600">{forecast.challenges}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Sun Sign: {chart.sun.sign}</h3>
                <p className="text-gray-600">{chart.sun.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Moon Sign: {chart.moon.sign}</h3>
                <p className="text-gray-600">{chart.moon.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Ascendant: {chart.ascendant.sign}</h3>
                <p className="text-gray-600">{chart.ascendant.description}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={() => {
                  setShowReportModal(false);
                  setMonthlyForecastReport(null);
                  navigate("/monthly-forecast", { state: { monthlyForecastReport } });
                }}
                variant="outline"
                className="w-full sm:flex-1"
              >
                View Full Report
              </Button>
              <Button
                onClick={() => {
                  setShowReportModal(false);
                  setMonthlyForecastReport(null);
                  navigate("/");
                }}
                variant="outline"
                className="w-full sm:flex-1"
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="">
      <div className="relative w-full overflow-hidden">
        <img
          src="/images/banner.jpeg"
          className="w-full h-[600px] scale-105 max-sm:scale-125 object-cover"
          alt="banner"
        />
        <div className="absolute top-1/2 sm:top-[80%] left-1/2 -translate-y-1/2 sm:-translate-y-[80%] -translate-x-1/2">
          <h1
            style={{ fontFamily: "Roboto" }}
            className="text-4xl max-[500px]:w-[280px] sm:text-5xl lg:text-[52px] leading-[50px] sm:leading-[60px] md:leading-[70px] font-sans font-extrabold uppercase text-white text-center w-full"
          >
            DE NATIONALE HULPLIJN <br />VOOR ELKAAR MET ELKAAR
          </h1>
          <img
            src="/images/newLogo.jpg"
            className="md:w-20 md:h-20 w-14 h-14 m-auto rounded-full object-cover"
            alt="logo"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Ontdek uw spirituele blauwdruk
          </h1>
          <p className="text-lg sm:text-xl mb-6 opacity-90">
            Ontgrendel persoonlijke inzichten in uw spirituele reis
          </p>
          {!user && (
            <Button
              variant="brand"
              className="rounded-full px-8 py-6 text-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-xl hover:shadow-2xl animate-[pulse_2s_infinite] hover:animate-none transition-all duration-300 transform hover:scale-105 border-2 border-white/20"
              onClick={() => navigate('/register')}
            >
              Bekijk hier uw spirituele blauwdruk
            </Button>
          )}
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center gap-1 shadow-md animate-[bounce_3s_infinite]">
              <Lock className="h-4 w-4" /> SSL Secure
            </Badge>
            <Badge className="bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white flex items-center gap-1 shadow-md animate-[bounce_3s_infinite]" style={{ animationDelay: '0.3s' }}>
              <Cpu className="h-4 w-4" /> AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl px-2 m-auto">
        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="lg:col-span-2 space-y-2 w-full">
            <div className="overflow-x-auto">
              <ProfileSection1 />
            </div>
            <div className="wrapper">
              <Tabs defaultValue="active">
                <TabsContent value="active">
                  {isLoadingPsychics ? (
                    <div className="flex justify-center p-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : psychicsError ? (
                    <p className="text-red-600 text-center">{psychicsError}</p>
                  ) : psychics.length === 0 ? (
                    <p className="text-gray-600 text-center">No psychics available at the moment.</p>
                  ) : (
                    <div className="grid gap-8 mb-10 w-full">
                      {psychics.slice(0, showing).map((psychic, i) => (
                        <div
                          key={psychic._id || i}
                          className="overflow-hidden w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                        >
                          <div className="p-6">
                            <div className="flex flex-col gap-6 md:flex-row">
                              <div className="flex flex-col items-center lg:w-64">
                                <div className="relative rounded-full border-4 border-violet-100 dark:border-violet-900">
                                  <img
                                    src={psychic.image}
                                    alt={psychic.name}
                                    className="object-cover h-32 w-32 rounded-full"
                                  />
                                </div>
                                <div className="mt-4 text-center">
                                  <h3 className="text-xl font-semibold">{psychic.name}</h3>
                                  <p className="text-slate-700 dark:text-slate-200">{psychic.type}</p>
                                  <div className="mt-1 flex items-center justify-center">
                                    {Array(Math.round(psychic.rating?.avgRating || 0))
                                      .fill(0)
                                      .map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                      ))}
                                  </div>
                                  <Badge className="mt-2 bg-emerald-500">Available</Badge>
                                </div>
                              </div>
                              <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  {psychic.abilities?.map((ability, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                                    >
                                      {ability}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300">{psychic.bio}</p>
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-900 dark:text-white">Latest Review</h4>
                                  <div className="mt-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                    {psychic.latestReview ? (
                                      <div className="flex items-center justify-end">
                                        <div className="flex">
                                          {Array(5)
                                            .fill(0)
                                            .map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`h-3 w-3 ${
                                                  i < psychic.latestReview.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                }`}
                                              />
                                            ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        No recent review available.
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-3">
                                  <Button
                                    variant="brand"
                                    className="rounded-full gap-2"
                                    onClick={() => handlePsychicSelect(psychic)}
                                    disabled={isSubmitting}
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
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {showing < psychics.length && (
                        <Button onClick={handleShowMore} variant="brand">
                          Show More
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="mt-12 py-8">
          <h2 className="text-3xl font-extrabold text-center mb-8">Ontgrendel diepere inzichten</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mb-6">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-semibold mb-4">PDF Astrologierapport</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ontvang een uitgebreid PDF-rapport met uw volledige horoscoop en analyses.
              </p>
              {pdfReport ? (
                <Button
                  variant="brand"
                  className="w-full rounded-full"
                  onClick={() => window.open(pdfReport.pdfUrl, "_blank")}
                >
                  Bekijk PDF
                </Button>
              ) : (
                <Button
                  variant="brand"
                  className="w-full rounded-full"
                  onClick={() => {
                    if (window.confirm("Dit kost 15 credits. Doorgaan?")) {
                      handlePdfUnlock();
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verwerken..." : "Ontgrendel (15 credits)"}
                </Button>
              )}
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-semibold mb-4">Astrologische blauwdruk</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ontdek uw kosmische blauwdruk met een persoonlijk astrologierapport, dat inzichten onthult vanuit uw zon-, maan- en ascendantteken.
              </p>
              <Button
                variant="brand"
                className="w-full rounded-full"
                onClick={handleAstrologyUnlock}
                disabled={isSubmitting}
              >
                Ontgrendel astrologierapport (5 credits)
              </Button>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-semibold mb-4">PDF Liefdescompatibiliteitsrapport</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ontvang een gedetailleerd PDF-rapport dat de compatibiliteit tussen u en uw partner analyseert op basis van astrologische profielen.
              </p>
              {lovePdfReport ? (
                <Button
                  variant="brand"
                  className="w-full rounded-full"
                  onClick={() => window.open(lovePdfReport.pdfUrl, "_blank")}
                >
                  Bekijk PDF
                </Button>
              ) : (
                <Button
                  variant="brand"
                  className="w-full rounded-full"
                  onClick={() => {
                    if (window.confirm("Dit kost 15 credits. Doorgaan?")) {
                      handleLovePdfUnlock();
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verwerken..." : "Ontgrendel (15 credits)"}
                </Button>
              )}
            </div>
          </div>
          <div className="mt-12 max-w-4xl mx-auto px-4 py-8">
            <div className="w-full flex justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-center mb-8">Bekijk video hier</h2>
                <video
                  className="w-full max-w-sm sm:max-w-md md:max-w-lg h-auto aspect-video rounded-lg object-cover shadow-md"
                  controls
                  preload="metadata"
                >
                  <source src="/Spiritueelchatten.mov" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="bg-green-600 text-white py-3 rounded-b-lg -mt-1">
                  <span className="text-lg font-semibold">Watch video</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={showReportModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowReportModal(false);
            setNumerologyReport(null);
            setAstrologyReport(null);
            setLoveCompatibilityReport(null);
            setMonthlyForecastReport(null);
            setSelectedPsychic(null);
            setModalType(null);
          }
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-xl shadow-lg z-50 focus:outline-none p-0">
          <div className="max-h-[90vh] overflow-y-auto">
            {numerologyReport ? (
              renderNumerologyReport()
            ) : astrologyReport ? (
              renderAstrologyReport()
            ) : loveCompatibilityReport ? (
              renderLoveCompatibilityReport()
            ) : monthlyForecastReport ? (
              renderMonthlyForecastReport()
            ) : modalType === "lovePdf" ? (
              <div className="p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-center">Love Compatibility PDF Report</h2>
                <div className="space-y-4">
                  {renderFormFields()}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowReportModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLovePdfSubmit}
                    variant="brand"
                    className="flex-1"
                    disabled={isSubmitting || isGeocoding}
                  >
                    {isSubmitting ? "Submitting..." : isGeocoding ? "Fetching Coordinates..." : "Generate PDF"}
                  </Button>
                </div>
              </div>
            ) : selectedPsychic ? (
              <div className="p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-center">
                  {selectedPsychic.name}'s {selectedPsychic.type} Reading
                </h2>
                <div className="space-y-4">
                  {renderFormFields()}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowReportModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    variant="brand"
                    className="flex-1"
                    disabled={isSubmitting || isGeocoding}
                  >
                    {isSubmitting ? "Submitting..." : isGeocoding ? "Fetching Coordinates..." : "Start Reading"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insufficient Credits</DialogTitle>
            <DialogDescription>
              U heeft {modalType === "loveCompatibility" ? 10 : modalType === "pdfAstrology" || modalType === "lovePdf" ? 15 : 5} credits nodig om uw {modalType === "astrology" ? "astrologische blauwdruk" : modalType === "loveCompatibility" ? "liefdescompatibiliteitsrapport" : modalType === "pdfAstrology" ? "PDF astrologierapport" : modalType === "lovePdf" ? "PDF liefdescompatibiliteitsrapport" : "maandvoorspelling"} te ontgrendelen, maar uw huidige saldo is {userCredits} credits. Voeg alstublieft meer credits toe om verder te gaan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowPaymentModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentRedirect}
              variant="brand"
              className="flex-1"
            >
              Add Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm {modalType === "astrology" ? "Astrology Report" : "Monthly Forecast"} Unlock
            </DialogTitle>
            <DialogDescription>
              Het ontgrendelen van uw {modalType === "astrology" ? "astrologische blauwdruk" : "maandvoorspelling"} kost 5 credits. Wilt u doorgaan?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowConfirmModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUnlock}
              variant="brand"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;