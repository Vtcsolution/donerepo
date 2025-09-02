import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Heart, Star, Zap, RotateCcw } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
const yearData = [
  { name: "Change", value: 70, color: "#3291F6" },
  { name: "Stability", value: 30, color: "#1E293B" },
]

const coreNumbers = [
  { type: "Soul Number", value: 3, icon: Heart, color: "#FF6B9D" },
  { type: "Character Number", value: 8, icon: Star, color: "#FFD93D" },
  { type: "Reset Number", value: 1, icon: RotateCcw, color: "#6BCF7F" },
]


export default function Numerology_Detail() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Numeron</h1>
          <p className="text-slate-400">Your Personal Numerology Dashboard</p>
        </div>

        {/* Core Numbers Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Life Path Number - Large Glowing Display */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center">Life Path Number</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-12">
                <div className="relative">
                  {/* Geometric background shapes */}
                  <div className="absolute -inset-8 opacity-20">
                    <div className="w-32 h-32 border border-[#3291F6] rotate-45 absolute top-0 left-0"></div>
                    <div className="w-24 h-24 border border-[#3291F6] rotate-12 absolute bottom-0 right-0"></div>
                  </div>

                  {/* Glowing number */}
                  <div className="relative z-10 text-9xl font-bold text-[#3291F6] text-center">
                    <span className="drop-shadow-[0_0_30px_#3291F6] animate-pulse">7</span>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-[#3291F6] opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Other Core Numbers */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {coreNumbers.map((number, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-[#3291F6]/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <number.icon className="w-6 h-6" style={{ color: number.color }} />
                      <div
                        className="absolute inset-0 blur-sm opacity-50"
                        style={{ backgroundColor: number.color }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-400">{number.type}</p>
                      <p className="text-2xl font-bold text-white">{number.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Predictions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Year Predictions */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#3291F6]" />
                <span>2024 Personal Year</span>
              </CardTitle>
              <CardDescription className="text-slate-400">Year 5 - Transformation & Change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64">
                <ChartContainer
                  config={{
                    change: {
                      label: "Change",
                      color: "#3291F6",
                    },
                    stability: {
                      label: "Stability",
                      color: "#1E293B",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={yearData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {yearData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#3291F6]">5</div>
                    <div className="text-sm text-slate-400">Personal Year</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Change Energy</span>
                  <span className="text-[#3291F6] font-semibold">70%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stability Energy</span>
                  <span className="text-slate-400 font-semibold">30%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geometric decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 border border-[#3291F6]/20 rotate-45"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 border border-[#3291F6]/20 rotate-12"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-[#3291F6]/10 rotate-45"></div>
        </div>
      </div>
    </div>
  )
}
