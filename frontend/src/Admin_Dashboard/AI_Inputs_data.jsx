
import { useEffect, useState } from 'react';
import Dashboard_Navbar from './Admin_Navbar';
import Doctor_Side_Bar from './SideBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Edit, Eye, MoreHorizontal, Star, Trash2 } from 'lucide-react';

const inputs = [
  {
    "name": "Sofia Vermeer",
    "gender": "Female",
    "birthday": 12,
    "birthmonth": 5,
    "birthyear": 1992,
    "birthhour": 14,
    "birthminute": 23,
    "birthsecond": 45,
    "location": "Amsterdam, Netherlands"
  },
  {
    "name": "Daan de Jong",
    "gender": "Male",
    "birthday": 3,
    "birthmonth": 11,
    "birthyear": 1988,
    "birthhour": 8,
    "birthminute": 15,
    "birthsecond": 10,
    "location": "Rotterdam, Netherlands"
  },
  {
    "name": "Luna Bakker",
    "gender": "Female",
    "birthday": 25,
    "birthmonth": 8,
    "birthyear": 1999,
    "birthhour": 22,
    "birthminute": 5,
    "birthsecond": 30,
    "location": "Utrecht, Netherlands"
  },
  {
    "name": "Noah Visser",
    "gender": "Male",
    "birthday": 7,
    "birthmonth": 1,
    "birthyear": 1990,
    "birthhour": 6,
    "birthminute": 40,
    "birthsecond": 5,
    "location": "The Hague, Netherlands"
  },
  {
    "name": "Emma Brouwer",
    "gender": "Female",
    "birthday": 16,
    "birthmonth": 3,
    "birthyear": 1995,
    "birthhour": 13,
    "birthminute": 30,
    "birthsecond": 20,
    "location": "Leiden, Netherlands"
  },
  {
    "name": "Thomas Willems",
    "gender": "Male",
    "birthday": 30,
    "birthmonth": 9,
    "birthyear": 1985,
    "birthhour": 19,
    "birthminute": 50,
    "birthsecond": 0,
    "location": "Groningen, Netherlands"
  }
]


const AI_Inputs_Data = () => {
    const [side, setSide] = useState(false); // Sidebar state
    const [isLoaded, setIsLoaded] = useState(false); // Sidebar state

    const user = {
        name:"User",
        email:"user@gmail.com",
        profile:"https://avatars.mds.yandex.net/i?id=93f523ab7f890b9175f222cd947dc36ccbd81bf7-9652646-images-thumbs&n=13"
    }

    // const format = (date) => {
    //       if (!date) return "Not provided"
    //       return new Date(date).toLocaleDateString("en-US", {
    //         year: "numeric",
    //         month: "long",
    //         day: "numeric",
    //       })
    //     }
       
    

    // const formatDate = (dateString) => {
    //     return format(new Date(dateString), "MMM d, yyyy")
    //   }
    
    
    useEffect(()=>{
        setIsLoaded(true)
    },[])

  return (
   <div>
    <div>
        <Dashboard_Navbar side={side} setSide={setSide} user={user}/>
    </div>
     <div className="dashboard-wrapper">
            <Doctor_Side_Bar side={side} setSide={setSide} user={user}/>
      <div className="dashboard-side min-h-screen ">       
            <h2 className=' text-2xl md:text-3xl lg:text-4xl font-sans font-extrabold text-center my-6'>AI Inputs Data</h2>
              <div className="rounded-md border overflow-hidden mx-2 md:mx-4 overflow-x-auto backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px]">
           <Card
                className={`w-full bg-white/10 border-white/20 backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px] ${isLoaded ? "animate-slide-in-bottom opacity-100" : "opacity-0"}`}
                style={{ animationDelay: "1.3s" }}
              >
                <CardHeader className="flex flex-row items-center">
                  <div className="grid gap-2">
                    <CardTitle>Inputs data</CardTitle>
                    <CardDescription>Recently Added Ai Inputs data to the platform</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="ml-auto transition-all duration-300 hover:bg-white/30"
                        variant="ghost"
                        size="sm"
                      >
                        <span>Filter</span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="animate-slide-in-top">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="transition-colors duration-200 hover:bg-white/20">
                        Most Recent
                      </DropdownMenuItem>
                      <DropdownMenuItem className="transition-colors duration-200 hover:bg-white/20">
                        Most Popular
                      </DropdownMenuItem>
                      <DropdownMenuItem className="transition-colors duration-200 hover:bg-white/20">
                        Highest Rated
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <Table className="[&_tbody_tr:hover]:bg-white/20">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Birth Day</TableHead>
                        <TableHead>Birth Month</TableHead>
                        <TableHead>Birth Year</TableHead>
                        <TableHead>Birth Hour</TableHead>
                        <TableHead>Birth Minute</TableHead>
                        <TableHead>Birth Second</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inputs.map((novel, index) => (
                        <TableRow
                          key={index}
                          className={`transition-all duration-300 hover:scale-[1.01] ${isLoaded ? "animate-slide-in-right opacity-100" : "opacity-0"}`}
                          style={{ animationDelay: `${1.4 + novel.delay}s` }}
                        >
                          <TableCell className="font-medium">
                            {novel.name}
                          </TableCell>
                          <TableCell>{novel.gender}...</TableCell>
                          <TableCell>{novel.birthday}</TableCell>
                          <TableCell>{novel.birthmonth}</TableCell>
                          <TableCell>{novel.birthyear}</TableCell>
                          <TableCell>{novel.birthhour}</TableCell>
                          <TableCell>{novel.birthminute}</TableCell>
                          <TableCell>{novel.birthhour}</TableCell>
                          <TableCell>{novel.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
        </div>
        </div>
    </div>
   </div>
   
  )
}

export default AI_Inputs_Data