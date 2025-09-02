import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, Calendar, Heart, Info, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, ShoppingCart, User } from "lucide-react"
import { useState } from "react";
import { Link } from "react-router-dom"
import { useAdminAuth } from "@/context/AdminAuthContext";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";


const Dashboard_Navbar = ({side,setSide,user}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen1, setIsOpen1] = useState(false);
const { admin, setAdmin } = useAdminAuth();
const navigate = useNavigate();


const handleLogout = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_BASE_URL}/api/admin/logout`, {}, {
      withCredentials: true,
    });
    toast.success("Logged out successfully");
    setAdmin(null); // clear admin context
    navigate("/admin/login");
  } catch (err) {
    console.error("Logout failed", err);
    toast.error("Failed to logout");
  }
};

    const [notifications, setNotifications] = useState([
      {
        id: "1",
        title: "New Message",
        message: "Sarah sent you a message: 'Hey, how are you doing?'",
        time: "2 min ago",
        read: false,
        type: "message",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "2",
        title: "Order Confirmed",
        message: "Your order #12345 has been confirmed and is being processed.",
        time: "15 min ago",
        read: false,
        type: "purchase",
      },
      {
        id: "3",
        title: "New Like",
        message: "Michael liked your recent post 'My new project launch'",
        time: "1 hour ago",
        read: false,
        type: "like",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: "4",
        title: "Meeting Reminder",
        message: "You have a team meeting scheduled in 30 minutes.",
        time: "2 hours ago",
        read: true,
        type: "reminder",
      },
      {
        id: "5",
        title: "Security Alert",
        message: "Unusual login attempt detected from a new device.",
        time: "Yesterday",
        read: true,
        type: "alert",
      },
      {
        id: "6",
        title: "System Update",
        message:
          "The platform will be updated tonight at 2 AM. Expect 10 minutes downtime.",
        time: "2 days ago",
        read: true,
        type: "info",
      },
    ]);
      const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };
  const toggleDropdown1 = () => {
    setIsOpen(!isOpen)
  }
  const toggleDropdown = () => {
    setIsOpen1(!isOpen1)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "like":
        return <Heart className="h-4 w-4 text-rose-500" />;
      case "reminder":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "info":
        return <Info className="h-4 w-4 text-sky-500" />;
    }
  };
  return (
    <div className=" h-[60px] border-b fixed top-0 left-0 right-0 z-[100] bg-[#3B5EB7] flex justify-between items-center lg:px-20 md:px-10 px-4">
        <div className="logo flex items-center gap-2 md:gap-4">
        <div className='my-2 bg-[#3B5EB7] border border-gray-200 p-2 min-[950px]:hidden text-white inline-block rounded-md'>
            <Menu onClick={() => setSide(!side)}/>
        </div>
        <Link to="/">
           <img src="/images/newLogo.jpg" alt="logo" className="w-12 h-12 object-cover rounded-full border border-gray-100 shadpw-sm" />
           </Link>
        </div>
        <div className=" flex items-center gap-4">
             <Button
                  variant="brand"
                  size="icon"
                  className="relative rounded-full"
                  onClick={toggleDropdown1}
                >
                  <Bell className="h-5 w-5 text-white hover:text-black" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button> 
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-16 z-50 w-80 rounded-lg border bg-white shadow-lg"
                    >
                      <div className="flex items-center justify-between border-b p-3">
                        <h3 className="font-medium">Notifications</h3>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            onClick={markAllAsRead}
                          >
                            Mark all as read
                          </Button>
                        )}
                      </div>

                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div>
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={cn(
                                  "flex gap-3 border-b p-3 transition-colors hover:bg-gray-50",
                                  !notification.read && "bg-blue-50/50"
                                )}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                  {notification.avatar ? (
                                    <Avatar className="h-9 w-9">
                                      <img
                                        src={
                                          notification.avatar ||
                                          "/placeholder.svg"
                                        }
                                        alt=""
                                      />
                                    </Avatar>
                                  ) : (
                                    getNotificationIcon(notification.type)
                                  )}
                                </div>

                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <p
                                      className={cn(
                                        "text-sm font-medium",
                                        !notification.read && "text-blue-600"
                                      )}
                                    >
                                      {notification.title}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      {notification.time}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {notification.message}
                                  </p>
                                </div>

                                {!notification.read && (
                                  <div className="flex h-2 w-2 shrink-0 items-center">
                                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6">
                            <Bell className="mb-2 h-10 w-10 text-gray-300" />
                            <p className="text-sm text-gray-500">
                              No notifications yet
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="border-t p-2">
                        <Link to="/all-notifications">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center text-xs"
                          >
                            View all notifications
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            <Button
                  variant="brand"
                  size="icon"
                  className="relative rounded-full"
                  onClick={toggleDropdown}
                >
                <img
  src={
    admin?.image
      ? admin.image
      : "https://avatars.mds.yandex.net/i?id=e1e984c8dfbafa0fbc6fc1b4a191a9d903249a02-7762396-images-thumbs&n=13"
  }
  className="w-10 h-10 rounded-full object-cover"
  alt="admin avatar"
/>

                </Button> 
                <AnimatePresence>
                  {isOpen1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-16 z-50 w-56 rounded-lg border bg-white shadow-lg"
                    >
                      <ul className="p-4 space-y-4">
                        <Link to="/admin/dashboard/profile"><li className="flex items-center gap-2 my-2 cursor-pointer"><LayoutDashboard/> Profile</li></Link>
                        <Link to="/admin/dashboard/updateprofile"><li className="flex items-center gap-2 my-2 cursor-pointer"><Settings/> Update Profile</li></Link>
<li className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
  <LogOut /> Logout
</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
            {/* <img src={ (user?.profile==="Profile" || user?.profile==="")? "https://avatars.mds.yandex.net/i?id=e1e984c8dfbafa0fbc6fc1b4a191a9d903249a02-7762396-images-thumbs&n=13": user?.profile } className=" w-10 h-10 rounded-full object-cover" alt="" /> */}
        </div>
    </div>
  )
}

export default Dashboard_Navbar