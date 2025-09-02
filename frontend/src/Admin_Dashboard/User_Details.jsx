import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Dashboard_Navbar from './Admin_Navbar';
import Doctor_Side_Bar from './SideBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { useAdminAuth } from "@/context/AdminAuthContext";
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Clock, User, Mail, Calendar, DollarSign } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const UserDetails = () => {
  const { admin } = useAdminAuth();
  const { userId } = useParams();
  const [side, setSide] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/admin/${userId}`, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });
      setUser(response.data.user);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error("Failed to fetch user details");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <div>
        <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
        <div className="dashboard-wrapper">
          <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
          <div className="dashboard-side min-h-screen p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
        <div className="dashboard-wrapper">
          <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
          <div className="dashboard-side min-h-screen flex flex-col items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-4">
                <p className="text-red-600 dark:text-red-400 font-medium">Error loading user details</p>
                <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
              </div>
              <Button variant="outline" onClick={fetchUserDetails}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
      <div className="dashboard-wrapper">
        <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
        <div className="dashboard-side p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Link 
                to="/admin/dashboard/allusers" 
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all users
              </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  User Profile: <span className="text-primary">{user.username}</span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-sm">
                {user.isActive ? 'Active' : 'Inactive'} Account
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                  <CardDescription>Basic user information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <img
                        src={user.image || "/images/default-profile.jpg"}
                        alt={user.username}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold">{user.username}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {user.firstName || 'Unknown'} {user.lastName || ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {user.dob ? new Date(user.dob).toLocaleDateString() : 'Date of birth not provided'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{user.credits} credits available</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{user.totalTime || 0} minutes total usage</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">${user.totalPayment || 0} total spent</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>User Details</CardTitle>
                  <CardDescription>Additional information and activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Bio</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      {user.bio ? (
                        <p className="text-sm">{user.bio}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No bio provided</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Transaction History</h3>
                      <Badge variant="outline" className="px-3 py-1">
                        {user.payments?.length || 0} transactions
                      </Badge>
                    </div>
                    
                    {user.payments && user.payments.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Plan</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Credits</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {user.payments.map((payment) => (
                              <TableRow key={payment.molliePaymentId}>
                                <TableCell>
                                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </TableCell>
                                <TableCell>{payment.planName}</TableCell>
                                <TableCell className="font-medium">
                                  ${payment.amount}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    +{payment.creditsPurchased}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={
                                      payment.status === 'paid' ? 'default' : 
                                      payment.status === 'failed' ? 'destructive' : 'outline'
                                    }
                                  >
                                    {payment.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 space-y-2">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No transactions found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;