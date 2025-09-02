
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
import { ChevronDown, Trash } from 'lucide-react';

const Transactionss = () => {
    const [side, setSide] = useState(false); // Sidebar state
    const [isLoaded, setIsLoaded] = useState(false); // Sidebar state

    const user = {
        name:"User",
        email:"user@gmail.com",
        profile:"https://avatars.mds.yandex.net/i?id=93f523ab7f890b9175f222cd947dc36ccbd81bf7-9652646-images-thumbs&n=13"
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
            <h2 className=' text-2xl md:text-3xl lg:text-4xl font-sans font-extrabold text-center my-6'>Transactions</h2>
             <div className="mx-2 md:mx-4">
              <Card
                className={`w-full bg-white/10 border border-gray-200  backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px] ${isLoaded ? "animate-slide-in-bottom opacity-100" : "opacity-0"}`}
                style={{ animationDelay: "1.3s" }}
              >
                <CardHeader className="flex flex-row items-center">
                  <div className="grid gap-2">
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Recently Transactions to the platform</CardDescription>
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
                        <TableHead>tran_id</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>createdAt</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {
                          id:"365319asd326",
                          profile:"/images/transaction_men_1.jpg",
                          name:"John Doe",
                          email:"john.doe@example.com",
                          title: "The Midnight Library",
                          amount: "$120",
                          credits:40,
                          createdAt: "2023-07-12",
                          delay: 0.1,
                        },
                        {
                          id:"365319asd326",
                          profile:"/images/transaction_men_1.jpg",
                          name:"John Doe",
                          email:"john.doe@example.com",
                          title: "The Midnight Library",
                          amount: "$120",
                           credits:60,
                          createdAt: "2023-07-12",
                          delay: 0.2,
                        },
                        {
                          id:"365319asd326",
                          profile:"/images/transaction_men_1.jpg",
                          name:"John Doe",
                          email:"john.doe@example.com",
                          title: "The Midnight Library",
                          amount: "$120",
                           credits:80,
                          createdAt: "2023-07-12",
                          delay: 0.3,
                        },
                        {
                          id:"365319asd326",
                          profile:"/images/transaction_men_1.jpg",
                          name:"John Doe",
                          email:"john.doe@example.com",
                          title: "The Midnight Library",
                          amount: "$120",
                           credits:120,
                          createdAt: "2023-07-12",
                          delay: 0.4,
                        },
                        {
                          id:"365319asd326",
                          profile:"/images/transaction_men_1.jpg",
                          name:"John Doe",
                          email:"john.doe@example.com",
                          title: "The Midnight Library",
                          amount: "$120",
                           credits:200,
                          createdAt: "2023-07-12",
                          delay: 0.5,
                        },
                      ].map((novel, index) => (
                        <TableRow
                          key={index}
                          className={`transition-all duration-300 hover:scale-[1.01] ${isLoaded ? "animate-slide-in-right opacity-100" : "opacity-0"}`}
                          style={{ animationDelay: `${1.4 + novel.delay}s` }}
                        >
                          <TableCell className="font-medium">
                            <div className=" flex items-center gap-2">
                                <img src={novel.profile} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h1 className="text-sm font-semibold">{novel.name}</h1>
                                    <p className="text-xs text-muted-foreground">{novel.email}</p>
                                </div>
                            </div>
                          </TableCell>
                          <TableCell>{novel.id}</TableCell>
                          <TableCell>{novel.amount}</TableCell>
                          <TableCell>{novel.createdAt}</TableCell>
                          <TableCell className="text-right">
                            {novel.credits}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="brand"><Trash/></Button>
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

export default Transactionss