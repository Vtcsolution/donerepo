"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { BookOpen, Download, Star, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"


const data = [
  { month: "Jan", revenue: 2000 },
  { month: "Feb", revenue: 2200 },
  { month: "Mar", revenue: 2700 },
  { month: "Apr", revenue: 2400 },
  { month: "May", revenue: 2800 },
  { month: "Jun", revenue: 3200 },
  { month: "Jul", revenue: 3100 },
  { month: "Aug", revenue: 3400 },
  { month: "Sep", revenue: 3700 },
  { month: "Oct", revenue: 3500 },
  { month: "Nov", revenue: 3800 },
  { month: "Dec", revenue: 4200 },
]


export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoaded, setIsLoaded] = useState(false)

  
   const { theme } = useTheme()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg">
          <CardContent className="p-2">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground">Revenue: ${payload[0].value.toLocaleString()}</p>
          </CardContent>
        </Card>
      )
    }
    return null
  }
  

  // Animation trigger for staggered entrance
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <h1 className="flex-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-white/20 border-white/20 backdrop-blur-md transition-all duration-300 hover:bg-white/30">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="animate-slide-in-top">
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="transition-all duration-300 hover:scale-110 hover:bg-white/30"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>
       
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Revenue",
                  icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
                  value: "$20,516",
                  change: "+12%",
                  delay: 0.7,
                },
                {
                  title: "Total Coaches",
                  icon: <Users className="h-4 w-4 text-muted-foreground" />,
                  value: "120",
                  change: "+18%",
                  delay: 0.8,
                },
                {
                  title: "Total Users",
                  icon: <User className="h-4 w-4 text-muted-foreground" />,
                   value: "200",
                  change: "+7%",
                  delay: 0.9,
                },
                {
                  title: "Total Spent Tokens",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ),
                  value: "10,000",
                  change: "+2.5%",
                  delay: 1.0,
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className={`bg-white/10 border-white/20 backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px] ${isLoaded ? "animate-slide-in-bottom opacity-100" : "opacity-0"}`}
                  style={{ animationDelay: `${stat.delay}s` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold animate-count-up">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-emerald-500">{stat.change}</span> from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="w-full border border-gray-200 mt-4 rounded-md p-2 md:p-4">
              <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis
          dataKey="month"
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={theme === "dark" ? "#adfa1d" : "#0ea5e9"}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
            </div>
          
      </main>
    </div>
  )
}
