
import { useState } from 'react';
import Dashboard_Navbar from './Admin_Navbar';
import Doctor_Side_Bar from './SideBar';
import DashboardPage from './DashboardComponents';
import {
  Bell,
  MessageSquare,
  ShoppingCart,
  Heart,
  Calendar,
  AlertTriangle,
  Info,
  ArrowLeft,
  MoreHorizontal,
  Check,
  Trash2,
  Archive,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"



const AllNotifications = () => {
    const [side, setSide] = useState(false); // Sidebar state

    // const formatDate = (date) => {
    //   if (!date) return "Not provided"
    //   return new Date(date).toLocaleDateString("en-US", {
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    //   })
    // }

    const user = {
        name:"User",
        email:"user@gmail.com",
        profile:"https://avatars.mds.yandex.net/i?id=93f523ab7f890b9175f222cd947dc36ccbd81bf7-9652646-images-thumbs&n=13"
    }
    const [notifications, setNotifications] = useState([
        {
          id: "1",
          title: "New Message from Sarah",
          message:
            "Hey, how are you doing? I was wondering if you'd like to meet up for coffee this weekend. Let me know what works for you!",
          time: "2 min ago",
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          read: false,
          type: "message",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        {
          id: "2",
          title: "Order #12345 Confirmed",
          message:
            "Your order has been confirmed and is being processed. Expected delivery date: May 25, 2025. Track your package with the provided tracking number.",
          time: "15 min ago",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          type: "purchase",
        },
        {
          id: "3",
          title: "Michael liked your post",
          message: "Michael liked your recent post 'My new project launch'. Your post has received 15 likes in total.",
          time: "1 hour ago",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          read: false,
          type: "like",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        {
          id: "4",
          title: "Team Meeting Reminder",
          message:
            "You have a team meeting scheduled in 30 minutes. Topic: Q2 Planning. Location: Conference Room A or join via the video link provided in the calendar invite.",
          time: "2 hours ago",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true,
          type: "reminder",
        },
        {
          id: "5",
          title: "Security Alert",
          message:
            "Unusual login attempt detected from a new device in Berlin, Germany. If this wasn't you, please secure your account immediately by changing your password.",
          time: "Yesterday",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          read: true,
          type: "alert",
        },
        {
          id: "6",
          title: "System Update Scheduled",
          message:
            "The platform will be updated tonight at 2 AM. Expect 10 minutes downtime. This update includes performance improvements and new features you requested.",
          time: "2 days ago",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          read: true,
          type: "info",
        },
        {
          id: "7",
          title: "New Message from Alex",
          message: "Hi there! Just checking in about the project status. Do you have the latest designs ready for review?",
          time: "3 days ago",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          read: true,
          type: "message",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        {
          id: "8",
          title: "Payment Successful",
          message:
            "Your subscription has been renewed successfully. The next billing date is June 22, 2025. Thank you for your continued support!",
          time: "4 days ago",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          read: true,
          type: "purchase",
        },
      ])
    
      const getNotificationIcon = (type) => {
        switch (type) {
          case "message":
            return <MessageSquare className="h-5 w-5 text-blue-500" />
          case "purchase":
            return <ShoppingCart className="h-5 w-5 text-green-500" />
          case "like":
            return <Heart className="h-5 w-5 text-rose-500" />
          case "reminder":
            return <Calendar className="h-5 w-5 text-amber-500" />
          case "alert":
            return <AlertTriangle className="h-5 w-5 text-red-500" />
          case "info":
            return <Info className="h-5 w-5 text-sky-500" />
        }
      }
    
      const getNotificationTypeBadge = (type) => {
        switch (type) {
          case "message":
            return (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Message
              </Badge>
            )
          case "purchase":
            return (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Purchase
              </Badge>
            )
          case "like":
            return (
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                Like
              </Badge>
            )
          case "reminder":
            return (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Reminder
              </Badge>
            )
          case "alert":
            return (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Alert
              </Badge>
            )
          case "info":
            return (
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                Update
              </Badge>
            )
        }
      }
    
      const formatTimestamp = (date) => {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }).format(date)
      }
    
      const markAsRead = (id) => {
        setNotifications(
          notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        )
      }
    
      const markAsUnread = (id) => {
        setNotifications(
          notifications.map((notification) => (notification.id === id ? { ...notification, read: false } : notification)),
        )
      }
    
      const deleteNotification = (id) => {
        setNotifications(notifications.filter((notification) => notification.id !== id))
      }
    
      const markAllAsRead = () => {
        setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
      }
    
      const sortedNotifications = [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      const unreadCount = notifications.filter((n) => !n.read).length
    

  return (
   <div>
    <div>
        <Dashboard_Navbar side={side} setSide={setSide} user={user}/>
    </div>
     <div className="dashboard-wrapper">
            <Doctor_Side_Bar side={side} setSide={setSide} user={user}/>
      <div className="dashboard-side min-h-screen ">       
            <div>
                <div className="mx-auto max-w-3xl px-4 py-8">
                        <div className="mb-8 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="rounded-full" asChild>
                              <a href="/admin/dashboard">
                                <ArrowLeft className="h-5 w-5" />
                              </a>
                            </Button>
                            <h1 className="text-2xl font-bold">Notifications</h1>
                            {unreadCount > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                {unreadCount} unread
                              </Badge>
                            )}
                          </div>
                
                          {unreadCount > 0 && (
                            <Button variant="outline" size="sm" onClick={markAllAsRead}>
                              Mark all as read
                            </Button>
                          )}
                        </div>
                
                        <div className="space-y-4">
                          {sortedNotifications.length > 0 ? (
                            sortedNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={cn(
                                  "group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md",
                                  !notification.read && "border-l-4 border-l-blue-500",
                                )}
                              >
                                <div className="flex gap-4">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                    {notification.avatar ? (
                                      <Avatar className="h-12 w-12">
                                        <img src={notification.avatar || "/placeholder.svg"} alt="" />
                                      </Avatar>
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                        {getNotificationIcon(notification.type)}
                                      </div>
                                    )}
                                  </div>
                
                                  <div className="flex-1">
                                    <div className="mb-1 flex items-start justify-between">
                                      <div>
                                        <h3 className={cn("text-base font-medium", !notification.read && "text-blue-700")}>
                                          {notification.title}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                          <span>{formatTimestamp(notification.timestamp)}</span>
                                          <span>•</span>
                                          {getNotificationTypeBadge(notification.type)}
                                          {!notification.read && (
                                            <>
                                              <span>•</span>
                                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                Unread
                                              </Badge>
                                            </>
                                          )}
                                        </div>
                                      </div>
                
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          {notification.read ? (
                                            <DropdownMenuItem onClick={() => markAsUnread(notification.id)}>
                                              <span className="mr-2">Mark as unread</span>
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                              <Check className="mr-2 h-4 w-4" />
                                              <span>Mark as read</span>
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem>
                                            <Archive className="mr-2 h-4 w-4" />
                                            <span>Archive</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => deleteNotification(notification.id)}
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border bg-white p-12 text-center">
                              <Bell className="mb-3 h-12 w-12 text-gray-300" />
                              <h3 className="mb-1 text-lg font-medium">No notifications</h3>
                              <p className="text-sm text-gray-500">You're all caught up!</p>
                            </div>
                          )}
                        </div>
                      </div>
            </div>
        </div>
    </div>
   </div>
   
  )
}

export default AllNotifications