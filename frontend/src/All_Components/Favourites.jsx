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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const advisors = [
  {
    advisor: "Dr. Emily Johnson",
    status: "Active",
    actions: ["View", "Edit", "Remove"],
  },
  {
    advisor: "Michael Lee",
    status: "Pending",
    actions: ["Approve", "Reject"],
  },
  {
    advisor: "Sofia Martinez",
    status: "Suspended",
    actions: ["Reactivate", "Delete"],
  },
  {
    advisor: "David Kim",
    status: "Offline",
    actions: ["Send Message", "View"],
  }
];

const Favourites = () => {
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
            <CardTitle className="text-xl font-bold">Favourites</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-2 sm:p-4">
          <Table>
  <TableCaption>A list of your recent Favourites.</TableCaption>
  <TableHeader>
    <TableRow>
        <TableHead>Advisor</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {advisors.map((item, index) => (
      <TableRow key={index}>
         <TableCell>{item.advisor}</TableCell>
        <TableCell>{item.status}</TableCell>
            <TableCell className="space-x-2">
          {item.actions.map((action, i) => (
            <button
              key={i}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {action}
            </button>
          ))}
        </TableCell>
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

export default Favourites
