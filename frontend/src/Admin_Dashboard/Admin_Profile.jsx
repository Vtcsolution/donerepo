
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Lock, Shield, Edit, Settings, LogOut } from "lucide-react"
import Dashboard_Navbar from "./Admin_Navbar"
import Doctor_Side_Bar from "./SideBar"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAdminAuth } from "@/context/AdminAuthContext"
import { Link } from "react-router-dom"

export default function AdminProfile() {
  const [showPassword, setShowPassword] = useState(false)
  const [side, setSide] = useState(false)

  const { admin } = useAdminAuth()
  const navigate = useNavigate()

  // ✅ Check if admin is not loaded yet
  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Loading admin profile...
      </div>
    )
  }

  const user = {
    name: admin.name,
    email: admin.email,
    profile: admin.image || "/placeholder.svg",
    role: "Administrator",
    lastLogin: "2 hours ago",
    status: "Active",
    password: "********",
  }

  return (
    <div>
      <Dashboard_Navbar side={side} setSide={setSide} user={user} />
      <div className="dashboard-wrapper">
        <Doctor_Side_Bar side={side} setSide={setSide} user={user} />
        <div className="dashboard-side min-h-screen">
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
            <div className="w-full max-w-4xl space-y-6">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="relative pb-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl -mt-16">
                      <AvatarImage src={user.profile} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center sm:text-left">
                      <CardTitle className="text-3xl font-bold text-slate-800 mb-2">{user.name}</CardTitle>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{user.status}</Badge>
                      </div>
                      <p className="text-slate-600">Last login: {user.lastLogin}</p>
                    </div>

                    <div className="flex gap-2">
                      <Link to="/admin/dashboard/updateprofile">
                        <Button variant="outline" size="sm" className="hover:bg-slate-50">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="hover:bg-slate-50">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                          <Mail className="w-5 h-5 text-slate-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-600">Email Address</p>
                            <p className="text-slate-800 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                          <Lock className="w-5 h-5 text-slate-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-600">Password</p>
                            <div className="flex items-center gap-2">
                              <p className="text-slate-800 font-medium font-mono">
                                {showPassword ? user.password : "••••••••"}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                                className="h-6 px-2 text-xs hover:bg-slate-200"
                              >
                                {showPassword ? "Hide" : "Show"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Account Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Account Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-700">Role</p>
                        <p className="text-xl font-bold text-blue-800">{user.role}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-700">Status</p>
                        <p className="text-xl font-bold text-green-800">{user.status}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-700">Last Login</p>
                        <p className="text-xl font-bold text-purple-800">{user.lastLogin}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button variant="outline" className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
