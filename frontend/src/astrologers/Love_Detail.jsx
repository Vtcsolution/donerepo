/* eslint-disable no-unused-vars */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Moon } from "lucide-react"

export default function LoveAstrologerOutput() {
  const zodiacSigns = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ]

  const planetaryScores = [
    { planet: "Sun", score: 85, description: "Core compatibility" },
    { planet: "Moon", score: 80, description: "Emotional connection" },
    { planet: "Venus", score: 60, description: "Love & attraction" },
    { planet: "Mars", score: 75, description: "Passion & energy" },
    { planet: "Mercury", score: 90, description: "Communication" },
    { planet: "Jupiter", score: 70, description: "Growth together" },
  ]

  const tips = [
    { emoji: "🔥", text: "Passionate but avoid power struggles", type: "warning" },
    { emoji: "💫", text: "Perfect communication flow", type: "positive" },
    { emoji: "⚡", text: "Electric attraction", type: "positive" },
    { emoji: "🌊", text: "Deep emotional understanding", type: "positive" },
    { emoji: "⚠️", text: "Watch for stubbornness", type: "warning" },
    { emoji: "✨", text: "Magical creative synergy", type: "positive" },
  ]

  const moonPhases = [
    { phase: "New Moon", date: "Dec 15", best: false },
    { phase: "Waxing Crescent", date: "Dec 22", best: true },
    { phase: "First Quarter", date: "Dec 30", best: false },
    { phase: "Waxing Gibbous", date: "Jan 6", best: true },
    { phase: "Full Moon", date: "Jan 13", best: true },
    { phase: "Waning Gibbous", date: "Jan 21", best: false },
    { phase: "Last Quarter", date: "Jan 29", best: false },
    { phase: "Waning Crescent", date: "Feb 5", best: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 text-blue-500 fill-current" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Amoura Love Reading
            </h1>
            <Heart className="w-8 h-8 text-blue-500 fill-current" />
          </div>
          <p className="text-lg text-gray-600">Aries ♈ + Libra ♎ Synastry Analysis</p>
        </div>

        {/* Synastry Chart */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
            <CardTitle className="text-center text-blue-700 flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Synastry Chart
              <Star className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="relative w-80 h-80 mx-auto">
              {/* Outer Ring - Aries */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 bg-gradient-to-br from-blue-100 to-transparent">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-blue-600 font-bold">
                  ♈ Aries
                </div>
              </div>

              {/* Inner Ring - Libra */}
              <div className="absolute inset-8 rounded-full border-4 border-indigo-300 bg-gradient-to-br from-indigo-100 to-transparent">
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-indigo-600 font-bold">
                  ♎ Libra
                </div>
              </div>

              {/* Aspect Lines */}
              <svg className="absolute inset-0 w-full h-full">
                <line x1="40%" y1="20%" x2="60%" y2="80%" stroke="#3291F6" strokeWidth="2" opacity="0.7" />
                <line x1="80%" y1="40%" x2="20%" y2="60%" stroke="#3291F6" strokeWidth="2" opacity="0.7" />
                <line x1="30%" y1="70%" x2="70%" y2="30%" stroke="#9CA3AF" strokeWidth="2" opacity="0.5" />
              </svg>

              {/* Central Heart */}
              <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Heart className="w-12 h-12 text-blue-500 fill-current" />
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500"></div>
                  <span>Harmonious Aspects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-gray-400"></div>
                  <span>Challenging Aspects</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compatibility Breakdown */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Planetary Compatibility Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {planetaryScores.map((planet) => (
                <div key={planet.planet} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">{planet.planet}</span>
                    <span className="text-lg font-bold text-blue-600">{planet.score}%</span>
                  </div>
                  <Progress value={planet.score} className="h-3 bg-blue-100" />
                  <p className="text-sm text-gray-600">{planet.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips & Warnings */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Cosmic Insights & Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {tips.map((tip, index) => (
                <Badge
                  key={index}
                  variant={tip.type === "positive" ? "default" : "secondary"}
                  className={`px-4 py-2 text-sm ${
                    tip.type === "positive"
                      ? "bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-700 hover:from-blue-300 hover:to-indigo-300"
                      : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 hover:from-amber-200 hover:to-orange-200"
                  }`}
                >
                  <span className="mr-2">{tip.emoji}</span>
                  {tip.text}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Romantic Timing */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Romantic Timing Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moonPhases.map((phase, index) => (
                <div
                  key={index}
                  className={`text-center p-4 rounded-lg border-2 transition-all ${
                    phase.best
                      ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {phase.phase.includes("New")
                      ? "🌑"
                      : phase.phase.includes("Waxing Crescent")
                        ? "🌒"
                        : phase.phase.includes("First Quarter")
                          ? "🌓"
                          : phase.phase.includes("Waxing Gibbous")
                            ? "🌔"
                            : phase.phase.includes("Full")
                              ? "🌕"
                              : phase.phase.includes("Waning Gibbous")
                                ? "🌖"
                                : phase.phase.includes("Last Quarter")
                                  ? "🌗"
                                  : "🌘"}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">{phase.phase}</div>
                  <div className="text-xs text-gray-600 mt-1">{phase.date}</div>
                  {phase.best && (
                    <div className="mt-2">
                      <Badge className="bg-blue-200 text-blue-700 text-xs">✨ Best for Love</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Best Dates for Commitment
              </h4>
              <p className="text-sm text-gray-700">
                The highlighted moon phases are most favorable for deepening your connection, having important
                conversations, and taking your relationship to the next level.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
