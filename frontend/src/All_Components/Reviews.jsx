import { useState } from "react";
import Navigation from "./Navigator";
import { ProfileSection } from "./Short_COmponents/Profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const reviews = [
  {
    type: "Career Guidance",
    advisor: "Emily Johnson",
    stars: 5,
    response: "Thank you! I'm glad I could help you with your career decisions. Wishing you all the best!",
  },
  {
    type: "Financial Planning",
    advisor: "Michael Lee",
    stars: 4,
    response: "Appreciate the feedback! Let me know if you have any further questions.",
  },
  {
    type: "Relationship Advice",
    advisor: "Sofia Martinez",
    stars: 3,
    response: "Thank you for your honesty. I'm always here to support you as best I can.",
  },
  {
    type: "Life Coaching",
    advisor: "David Kim",
    stars: 5,
    response: "It was a pleasure working with you! Stay motivated and positive!",
  }
];

const Reviews = () => {
    const [message, setMessage] = useState('');

    const handleViewMessage = (msg)=>{
        setMessage(msg)
    }
  return (
    <div className=" px-2 sm:px-4 min-h-screen">
      <div className=" max-w-7xl mx-auto pb-10">
        <Navigation />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
          <div className="card-3 w-full">
            <Card className="w-full rounded-sm shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold">Published reviews</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-2 sm:p-4">
          <Table>
  <TableCaption>A list of your recent Reviews.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Type</TableHead>
      <TableHead>Advisor</TableHead>
      <TableHead>Stars</TableHead>
      <TableHead>Advisor Response</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {reviews.map((review, index) => (
      <TableRow key={index}>
        <TableCell>{review.type}</TableCell>
        <TableCell>{review.advisor}</TableCell>
        <TableCell>{review.stars} ⭐</TableCell>
            <TableCell>{review.response.slice(0,20)}...   
                <Dialog>
      <DialogTrigger asChild>
        <span className="text-base text-[#3B5EB7] hover:underline cursor-pointer" onClick={()=>handleViewMessage(review.response)}>See</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogDescription>
            Response
          </DialogDescription>
        </DialogHeader>
        <p className=" text-base font-[350] font-sans">{message}</p>
      </DialogContent>
    </Dialog></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
        </CardContent>
      </Card>
          </div>
          <div className=" mt-2">
            <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
          </div>
          </div>

          <div className="lg:col-span-1 max-lg:hidden">
            <ProfileSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews
