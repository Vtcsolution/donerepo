import { Mail, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AdvisorCard({ advisor }) {
  const statusColors = {
    online: "bg-green-500 text-white",
    offline: "bg-gray-500 text-white",
    busy: "bg-amber-500 text-white",
  };

  const statusLabels = {
    online: "Available",
    offline: "Offline",
    busy: "Busy",
  };

  return (
    <Card data-aos="fade-right" data-aos-duration="800" className="overflow-hidden border rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 p-6 flex flex-col items-center justify-center">
            <div className="relative overflow-hidden mb-3">
              <img
                src={advisor.image || "/placeholder.svg"}
                alt={advisor.name}
                className="object-cover w-32 h-32 rounded-full"
              />
            </div>
            <h3 className="text-xl font-bold text-center">{advisor.name}</h3>
            <div className="flex items-center mt-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < (advisor.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">{advisor.reviewCount || 0} reviews</p>
            <span className={`px-3 py-1 text-sm rounded-full mt-3 ${statusColors[advisor.status] || "bg-gray-300 text-black"}`}>
              {statusLabels[advisor.status] || "Unknown"}
            </span>
          </div>

          <div className="md:w-2/3 p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {(advisor.skills || []).map((skill, index) => (
                <Badge key={index} variant="secondary" className="rounded-full">
                  {skill}
                </Badge>
              ))}
            </div>

            <p className="text-gray-700 mb-6">{advisor.description || "No description available."}</p>

            {advisor.latestReview && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Latest Review</h4>
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{advisor.latestReview.name}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < (advisor.latestReview.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{advisor.latestReview.text}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 p-4 flex justify-between">
        <div className="flex items-center gap-2">
          <Link to="/form-fill">
            <Button variant="brand" className="rounded-full gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat €1.75/min
            </Button>
          </Link>
        </div>
        <Button variant="ghost" size="icon">
          <Mail className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
