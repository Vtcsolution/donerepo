import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

export default function AI_Talk_Form() {
  const [birthChartData, setBirthChartData] = useState({
    name: "",
    gender: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    birthHour: "",
    birthMinute: "",
    birthPlace: "",
    birthSeconds:""
  })

  const [first, setFirst] = useState(false)


  const handleBirthChartSubmit = (e) => {
    e.preventDefault()
    console.log("Birth Chart Data:", birthChartData)
  }
  const navigate = useNavigate();
  const handlePuch = ()=>{
    navigate("/chat/:psychicId")
  }


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
    birthSeconds
  } = birthChartData;

  if (
    name &&
    gender &&
    birthDay &&
    birthMonth &&
    birthYear &&
    birthHour &&
    birthMinute &&
    birthPlace && 
    birthSeconds
  ) {
    setFirst(true);
  } else {
    setFirst(false);
  }
}, [birthChartData]);


  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1">
          {/* Kundli / Birth Chart Form */}
          <Card className="border-2 border-gray-200 bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">Birth Chart</CardTitle>
              <p className="text-lg font-semibold text-gray-700 mt-2">Enter Birth Details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBirthChartSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Name"
                    value={birthChartData.name}
                    onChange={(e) => setBirthChartData({ ...birthChartData, name: e.target.value })}
                    className="h-12 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Select
                    value={birthChartData.gender}
                    onValueChange={(value) => setBirthChartData({ ...birthChartData, gender: value })}
                  >
                    <SelectTrigger className="h-12 bg-white border-gray-300 text-gray-700">
                      <SelectValue placeholder="Male" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="birthDay" >BirthDay</Label>
                    <Input
                    id="birthDay"
                    placeholder="25"
                    value={birthChartData.birthDay}
                    onChange={(e) => setBirthChartData({ ...birthChartData, birthDay: e.target.value })}
                    className="h-12 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                  />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthMonth" >BirthMonth</Label>
                    <Input
                    id="birthMonth"
                    placeholder="5"
                    value={birthChartData.birthMonth}
                    onChange={(e) => setBirthChartData({ ...birthChartData, birthMonth: e.target.value })}
                    className="h-12 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                  />
                  </div>
                 <div className="space-y-2">
                    <Label htmlFor="birthYear" >BirthYear</Label>
                     <Input
                     id="birthYear"
                    placeholder="2025"
                    value={birthChartData.birthYear}
                    onChange={(e) => setBirthChartData({ ...birthChartData, birthYear: e.target.value })}
                    className="h-12 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                  />
                 </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                    <Label htmlFor="birthHour" >BirthHour</Label>
                     <Input
                     id="birthHour"
                    placeholder="15"
                    value={birthChartData.birthHour}
                    onChange={(e) => setBirthChartData({ ...birthChartData, birthHour: e.target.value })}
                    className="h-12 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                  />
                 </div>
                      <div className="space-y-2">
                    <Label htmlFor="birthMinute" >BirthMinute</Label>
                    <Input
                    id="birthMinute"
                    placeholder="5"
                    value={birthChartData.birthMinute}
                    onChange={(e) => setBirthChartData({ ...birthChartData, birthMinute: e.target.value })}
                    className="h-12 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                  />
                 </div>
                      <div className="space-y-2">
                    <Label htmlFor="birthSeconds" >BirthSeconds</Label>
                   <Input
                   id="birthSeconds"
                    placeholder="26"
                    className="h-12 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                     onChange={(e) => setBirthChartData({ ...birthChartData, birthSeconds: e.target.value })}
                  />
                 </div>
                  
                </div>

                <div>
                  <Input
                    placeholder="Birth place"
                    value={birthChartData.birthPlace}
                    onChange={(e) => setBirthChartData({ ...birthChartData, birthPlace: e.target.value })}
                    className="h-12 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                  />
                </div>

                <div className="pt-4">
                  <Button
                  onClick={handlePuch}
                  disabled={first===false}
                    type="submit"
   
   variant="brand"                 className="w-full h-12 font-semibold text-lg rounded-md transition-colors"
                  >
                    Get Started
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
