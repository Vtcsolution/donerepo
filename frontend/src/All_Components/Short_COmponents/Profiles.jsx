import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function ProfileSection() {
  const [psychics, setPsychics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Add navigation hook

  useEffect(() => {
    const fetchPsychics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/psychics`);
        const data = await response.json();
        if (data.success) {
          setPsychics(data.data || []);
        } else {
          throw new Error(data.error || "Failed to fetch psychics");
        }
      } catch (error) {
        console.error('Error fetching psychics:', error);
        setError(error.message);
        setPsychics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychics();
  }, []);

  // Function to handle view button click
  const handleViewProfile = (psychicId) => {
    navigate(`/psychic/${psychicId}`);
  };

  return (
    <div>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-[#3B5EB7] text-white">
          <CardTitle className="py-2">Recommended Advisors</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="space-y-2">
            {psychics.map((psychic) => (
              <div
                key={psychic._id}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="relative overflow-hidden border-2 border-white">
                      <img 
                        src={psychic.image || "/placeholder.svg"} 
                        alt={psychic.name} 
                        className="object-cover rounded-full h-12 w-12" 
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{psychic.name}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{psychic.type}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="brand"
                  className="text-white shadow-sm transition-all hover:shadow"
                  onClick={() => handleViewProfile(psychic._id)} // Add onClick handler
                >
                  VIEW
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <hr className="text-gray-200 my-4" />
      <div>
        <p className="font-[350] font-sans">
          Find answers to your life's questions! Our spiritual advisors are available to support you around the clock. 
          Choose your preferred advisor and contact them directly. Our transparent pricing ensures you maintain 
          complete cost control at all times.
        </p>
        <p className="font-bold font-sans mt-2">© 2025 Advisor</p>
      </div>
    </div>
  )
}

function ProfileSection1() {
  const [psychics, setPsychics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Add navigation hook

  useEffect(() => {
    const fetchPsychics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/psychics`);
        const data = await response.json();
        
        if (data.success) {
          setPsychics(data.data || []);
        } else {
          throw new Error(data.error || "Failed to fetch psychics");
        }
      } catch (error) {
        console.error('Error fetching psychics:', error);
        setError(error.message);
        setPsychics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychics();
  }, []);

  // Function to handle psychic card click
  const handlePsychicClick = (psychicId) => {
    navigate(`/psychic/${psychicId}`);
  };

  return (
    <Card className="border-none shadow-md overflow-x-auto">
      <CardContent className="p-2">
        <h1 className="text-xl font-sans font-extrabold mb-2 text-center">AI Coach</h1>
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {psychics.map((psychic) => (
            <div
              key={psychic._id}
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 transition-shadow hover:shadow-md cursor-pointer" // Add cursor-pointer
              onClick={() => handlePsychicClick(psychic._id)} // Add onClick handler
            >
              <div className="flex flex-col justify-center items-center gap-3">
                <div className="relative">
                  <div className="relative overflow-hidden">
                    <img 
                      src={psychic.image || "/placeholder.svg"} 
                      alt={psychic.name} 
                      className="object-cover rounded-full max-h-16 max-w-16" 
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 text-sm text-center font-sans font-[350]">
                    {psychic.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <p className="text-sm font-sans font-bold text-center">
Eén minuut gratis chatten met de AI-coach. Daarna dient u credits aan te schaffen.      </p>
    </Card>
  )
}

export { ProfileSection, ProfileSection1 }