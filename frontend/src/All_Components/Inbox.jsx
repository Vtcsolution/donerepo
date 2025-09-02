"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CircleChevronLeft,
  Plus,
  Search,
  Star,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

const messages = [
  {
    id: "1",
    sender: {
      name: "Google Support",
      email: "support@google.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initial: "G",
    },
    subject: "Security Alert: New Sign-In Detected",
    preview: "We noticed a new sign-in to your Google account. Please review the activity immediately.",
    date: "8:47 AM",
    read: false,
    starred: true,
    category: "primary",
  },
  {
    id: "2",
    sender: {
      name: "LinkedIn",
      email: "notifications@linkedin.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initial: "L",
    },
    subject: "You appeared in 23 searches this week!",
    preview: "See who’s viewing your profile and discover new networking opportunities.",
    date: "Yesterday",
    read: true,
    starred: false,
    category: "primary",
  },
  {
    id: "3",
    sender: {
      name: "Sarah Williams",
      email: "sarah.williams@startuphub.com",
      initial: "SW",
    },
    subject: "Meeting Follow-up & Action Items",
    preview: "Thanks for attending today's sync. Here’s a quick recap and next steps to move forward.",
    date: "May 20",
    read: false,
    starred: false,
    category: "primary",
  },
  {
    id: "4",
    sender: {
      name: "Instagram",
      email: "updates@mail.instagram.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initial: "I",
    },
    subject: "You have 8 new followers",
    preview: "Your profile is gaining traction! See who's following you and engage back.",
    date: "May 19",
    read: true,
    starred: false,
    category: "social",
  }
];


export default function Inbox() {

  return (
    <div className="sm:mx-4 mx-2">
      <div className="flex max-sm:flex-col max-w-6xl mx-auto border mb-10 border-gray-200 min-h-[80vh] overflow-hidden mt-4 bg-white">
      {/* Sidebar */}
      <div
        className={
          "flex flex-col w-full sm:w-64 border-r transition-all duration-300 bg-white"
      }
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Inbox</h1>
          </div>
         <Link to="/dashboard">
            <Button variant="ghost" size="icon" className={"w-full px-2"}>
            <CircleChevronLeft className="h-5 w-5" /> Back
          </Button>
         </Link>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages" className="pl-9 bg-gray-50" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <ul className="space-y-1">
            <li>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <User className="h-4 w-4" />
                <span>Advisor</span>
                <Badge className="ml-auto bg-rose-500">3</Badge>
              </Button>
            </li>
            {/* <li>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Star className="h-4 w-4" />
                <span>Starred</span>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Clock className="h-4 w-4" />
                <span>Snoozed</span>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <MailOpen className="h-4 w-4" />
                <span>Sent</span>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <FileText className="h-4 w-4" />
                <span>Drafts</span>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Archive className="h-4 w-4" />
                <span>Archive</span>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Trash2 className="h-4 w-4" />
                <span>Trash</span>
              </Button>
            </li> */}
          </ul>
        </nav>

      </div>

      {/* Main Content */}
      <div className={"flex flex-col flex-1 max-sm:border max-sm:border-gray-200 max-sm:mt-8 overflow-hidden"}>
        {/* Main Header */}

        {/* Message List or Message Detail */}
       
          <div className="flex-1 overflow-hidden">
            <h2 className="sm:hidden text-center text-2xl font-sans font-extrabold mt-2">Messages</h2>
                <ul className="divide-y">
                  {messages
                    .map((message) => (
                      <li
                        key={message.id}
                        className={
                          "hover:bg-gray-50 cursor-pointer transition-colors"
                        }
                      >
                        <div className="flex items-start gap-4 p-4">
                          <Avatar className="mt-1 h-10 w-10">
                            <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                            <AvatarFallback>{message.sender.initial}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn("text-sm font-medium truncate", !message.read && "font-semibold")}>
                                {message.sender.name}
                              </p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{message.date}</p>
                            </div>
                            <p className={cn("text-sm font-medium truncate", !message.read && "font-semibold")}>
                              {message.subject}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            {!message.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            {message.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
                {/* <ul className="divide-y">
                  {messages
                    .filter((message) => message.category === "social")
                    .map((message) => (
                      <li
                        key={message.id}
                        className={cn(
                          "hover:bg-gray-50 cursor-pointer transition-colors",
                          !message.read && "bg-blue-50/50",
                        )}
                      >
                        <div className="flex items-start gap-4 p-4">
                          <Avatar className="mt-1 h-10 w-10">
                            <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                            <AvatarFallback>{message.sender.initial}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn("text-sm font-medium truncate", !message.read && "font-semibold")}>
                                {message.sender.name}
                              </p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{message.date}</p>
                            </div>
                            <p className={cn("text-sm font-medium truncate", !message.read && "font-semibold")}>
                              {message.subject}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            {!message.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            {message.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
                <ul className="divide-y">
                  {messages
                    .filter((message) => message.category === "promotions")
                    .map((message) => (
                      <li
                        key={message.id}
                        className={cn(
                          "hover:bg-gray-50 cursor-pointer transition-colors",
                          !message.read && "bg-blue-50/50",
                        )}
                      >
                        <div className="flex items-start gap-4 p-4">
                          <Avatar className="mt-1 h-10 w-10">
                            <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                            <AvatarFallback>{message.sender.initial}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn("text-sm font-medium truncate", !message.read && "font-semibold")}>
                                {message.sender.name}
                              </p>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">{message.date}</p>
                            </div>
                            <p className={cn("text-sm font-medium truncate", !message.read && "font-semibold")}>
                              {message.subject}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            {!message.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            {message.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul> */}
          </div>

        {/* Compose Button */}
        <div className="absolute bottom-6 right-6">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
    </div>
  )
}
