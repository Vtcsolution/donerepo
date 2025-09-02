
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

const reviewsData = [
  {
    _id: "68246379fed0a87617ec7228",
    username: "Ayesha Khan",
    profile: "https://res.cloudinary.com/dvshyja15/image/upload/v1747215223/a2uzlbnmbtclaki6wnar.webp",
    apprecient: "A Heartwarming Love Story",
    rating: 4,
    comment:
      "The story had me hooked from start to finish. The love between the characters felt real, and the twists were so unexpected. Highly recommend.",
    location: "Pakistan",
    createdAt: "2025-05-14T09:33:45.892Z",
  },
  {
    _id: "682463a9fed0a87617ec722a",
    username: "John Doe",
    profile: "https://res.cloudinary.com/dvshyja15/image/upload/v1747215272/r5grwigof1vm4qfjl7ry.jpg",
    apprecient: "An Adventurous Ride",
    rating: 5,
    comment:
      "This novel took me on an exciting journey through uncharted territories. The suspense kept me on edge, and the adventure never slowed down.",
    location: "United States",
    createdAt: "2025-05-14T09:34:33.104Z",
  },
  {
    _id: "68246418fed0a87617ec722c",
    username: "Sofia Rayes",
    profile: "https://res.cloudinary.com/dvshyja15/image/upload/v1747215384/vu9f9kjrzht0si5deybp.webp",
    apprecient: "Emotional and Raw",
    rating: 4,
    comment:
      "The story was an emotional roller coaster. It touched my heart in ways I didn't expect. I could relate so much to the characters' struggles.",
    location: "Mexico",
    createdAt: "2025-05-14T09:36:24.680Z",
  },
  {
    _id: "68246446fed0a87617ec722e",
    username: "Emily Parker",
    profile: "https://res.cloudinary.com/dvshyja15/image/upload/v1747215430/jbgssiggqkojksfq3ak8.webp",
    apprecient: "A Beautifully Written Story",
    rating: 5,
    comment:
      "The writing style was exquisite, and the depth of the characters was incredible. I could feel the emotions radiating from the pages.",
    location: "United Kingdom",
    createdAt: "2025-05-14T09:37:10.509Z",
  },
  {
    _id: "68246468fed0a87617ec7230",
    username: "Michael Brown",
    profile: "https://res.cloudinary.com/dvshyja15/image/upload/v1747215464/vac32mh3l6zf6oa7248x.webp",
    apprecient: "Thrilling and Suspenseful",
    rating: 5,
    comment:
      "I was on the edge of my seat the whole time. The plot twists were genius, and I couldn't stop reading. A must-read for thriller lovers!",
    location: "Canada",
    createdAt: "2025-05-14T09:37:44.399Z",
  },
]

const Reviewss = () => {
    const [side, setSide] = useState(false); // Sidebar state
    const [isLoaded, setIsLoaded] = useState(false); // Sidebar state

    const user = {
        name:"User",
        email:"user@gmail.com",
        profile:"https://avatars.mds.yandex.net/i?id=93f523ab7f890b9175f222cd947dc36ccbd81bf7-9652646-images-thumbs&n=13"
    }

    const format = (date) => {
          if (!date) return "Not provided"
          return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }
       
    

    const formatDate = (dateString) => {
        return format(new Date(dateString), "MMM d, yyyy")
      }
    
       const renderRating = (rating) => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
          if (i <= rating) {
            stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
          } else if (i - 0.5 === rating) {
            stars.push(<StarHalf key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
          } else {
            stars.push(<Star key={i} className="h-4 w-4 text-muted-foreground" />)
          }
        }
        return <div className="flex">{stars}</div>
      }
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
            <h2 className=' text-2xl md:text-3xl lg:text-4xl font-sans font-extrabold text-center my-6'>Reviews</h2>
              <div className="rounded-md border overflow-hidden mx-2 md:mx-4 overflow-x-auto backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px]">
           <Card
                className={`w-full bg-white/10 border-white/20 backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px] ${isLoaded ? "animate-slide-in-bottom opacity-100" : "opacity-0"}`}
                style={{ animationDelay: "1.3s" }}
              >
                <CardHeader className="flex flex-row items-center">
                  <div className="grid gap-2">
                    <CardTitle>Reviews</CardTitle>
                    <CardDescription>Recently Reviews to the platform</CardDescription>
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
                        <TableHead>User</TableHead>
                        <TableHead>review</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewsData.map((novel, index) => (
                        <TableRow
                          key={index}
                          className={`transition-all duration-300 hover:scale-[1.01] ${isLoaded ? "animate-slide-in-right opacity-100" : "opacity-0"}`}
                          style={{ animationDelay: `${1.4 + novel.delay}s` }}
                        >
                          <TableCell className="font-medium">
                            <div className=" flex items-center gap-2">
                                <img src={novel.profile} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                            </div>
                          </TableCell>
                          <TableCell>{novel.comment.slice(0,30)}...</TableCell>
                          <TableCell>{renderRating(novel.rating)}</TableCell>
                          <TableCell>{novel.location}</TableCell>
                          <TableCell>
                            {formatDate(novel.createdAt)}
                          </TableCell>
                           <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit review
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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

export default Reviewss