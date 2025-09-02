import { useEffect, useState } from 'react';
import Dashboard_Navbar from './Admin_Navbar';
import Doctor_Side_Bar from './SideBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { toast } from 'sonner';

const UserChats = () => {
  const [side, setSide] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [chats, setChats] = useState([]);
  const { admin } = useAdminAuth();

  const format = (date) => {
    if (!date) return "Not provided";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/chat/admin/all-chats`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setChats(data.chats);
        } else {
          toast.error("Failed to load chats");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading chat data");
      }
    };

    fetchChats();
    setIsLoaded(true);
  }, []);

  return (
    <div>
      <Dashboard_Navbar side={side} setSide={setSide} user={admin} />

      <div className="dashboard-wrapper">
        <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />

        <div className="dashboard-side min-h-screen">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-sans font-extrabold text-center my-6">
            Users Chat
          </h2>

          <div className="rounded-md border overflow-hidden mx-2 md:mx-4 overflow-x-auto backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px]">
            <Card
              className={`w-full bg-white/10 border-white/20 backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px] ${
                isLoaded ? "animate-slide-in-bottom opacity-100" : "opacity-0"
              }`}
              style={{ animationDelay: "1.3s" }}
            >
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Users Chat data</CardTitle>
                  <CardDescription>
                    Recently Added user chats data to the platform
                  </CardDescription>
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
                      <TableHead>User</TableHead>
                      <TableHead>Advisor</TableHead>
                      <TableHead>Credits Used</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Chats</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {chats.map((chat, index) => (
                      <TableRow
                        key={index}
                        className={`transition-all duration-300 hover:scale-[1.01] ${
                          isLoaded ? "animate-slide-in-right opacity-100" : "opacity-0"
                        }`}
                      >
                        <TableCell className="font-medium">
                          {chat.user?.username || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <img
                            src={chat.user?.image || "/images/default-user.jpg"}
                            alt="user"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </TableCell>
                        <TableCell>
                          <img
                            src={chat.advisor?.image || "/images/default-advisor.jpg"}
                            alt="advisor"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </TableCell>
                        <TableCell>{chat.credits}</TableCell>
                        <TableCell>{format(chat.createdAt)}</TableCell>
                        <TableCell>
                          <Link to={`/admin/dashboard/user-chat-detail/${chat.id}`}>
                            <Button variant="brand">Chat</Button>
                          </Link>
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
  );
};

export default UserChats;
