import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Dashboard_Navbar from './Admin_Navbar';
import Doctor_Side_Bar from './SideBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Trash, DollarSign } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from "@/context/AdminAuthContext";

const AllUsers = () => {
  const { admin } = useAdminAuth();
  const [side, setSide] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [psychics, setPsychics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState("");
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleBio = (bioo) => setBio(bioo);

  const fetchPsychics = async () => {
    try {
      console.log('Admin token:', admin.token);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });

      console.log('API Response:', response.data);
      setPsychics(response.data.users || []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err.response ? err.response.data : err.message);
      setError(err.message);
      setLoading(false);
      toast.error("Failed to fetch advisors");
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    fetchPsychics();
  }, []);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });
      toast.success("User deleted successfully");
      fetchPsychics();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteUserId(null);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      setIsUploading(true);
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        if (imageUrl) updatedData.image = imageUrl;
      }
      await axios.put(`${import.meta.env.VITE_BASE_URL}/api/users/update-user/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });
      toast.success("Updated successfully");
      fetchPsychics();
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCredits = async (userId) => {
    try {
      setIsAddingCredits(true);
      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/wallet/add-credits`, {
        userId,
        credits: parseFloat(creditsToAdd)
      }, {
        headers: { Authorization: `Bearer ${admin.token}` },
        withCredentials: true,
      });
      toast.success(`Successfully added ${creditsToAdd} credits`);
      setCreditsToAdd("");
      fetchPsychics();
    } catch (err) {
      toast.error("Failed to add credits");
    } finally {
      setIsAddingCredits(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openDeleteDialog = (id) => {
    setDeleteUserId(id);
    setDeleteDialogOpen(true);
  };

  if (loading || error) {
    return (
      <div>
        <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
        <div className="dashboard-wrapper">
          <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
          <div className="dashboard-side min-h-screen flex items-center justify-center">
            {loading ? <p>Loading advisors...</p> : <p className="text-red-500">Error: {error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
      <div className="dashboard-wrapper">
        <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
        <div className="dashboard-side min-h-screen">
          <h2 className='text-3xl font-extrabold text-center my-6'>All Advisors</h2>
          <div className="mx-4">
            <Card className="bg-white/10 border border-gray-200 backdrop-blur-md shadow-xl">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Advisors Data</CardTitle>
                  <CardDescription>All advisors listed below</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="ml-auto" variant="ghost" size="sm">
                      Filter <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Most Recent</DropdownMenuItem>
                    <DropdownMenuItem>Most Popular</DropdownMenuItem>
                    <DropdownMenuItem>Highest Rated</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Bio</TableHead>
                      <TableHead>Total Credits</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {psychics.map((psychic) => (
                      <TableRow key={psychic._id}>
                        <TableCell>
                          <img src={psychic.image || "/images/default-profile.jpg"} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                        </TableCell>
                        <TableCell>{psychic.username}</TableCell>
                        <TableCell>
                          {psychic.bio?.slice(0, 20)}...
                          <Dialog>
                            <DialogTrigger asChild>
                              <span
                                onClick={() => handleBio(psychic.bio)}
                                className='text-cyan-500 hover:underline cursor-pointer ml-1'
                              >
                                See More
                              </span>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Full Bio</DialogTitle>
                                <DialogDescription>{bio}</DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>{psychic.credits}</TableCell>
                        <TableCell>
                          <Link
                            to={`/admin/dashboard/user-details/${psychic._id}`}
                            className='text-cyan-500 hover:underline cursor-pointer'
                          >
                            View Details
                          </Link>
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="brand"><Edit /></Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Advisor</DialogTitle>
                                <DialogDescription>Update advisor details</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="image" className="text-right">Image</Label>
                                  <div className="col-span-3 flex items-center gap-4">
                                    <img src={imagePreview || psychic.image || "/images/default-profile.jpg"} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="name" className="text-right">Name</Label>
                                  <Input id="name" defaultValue={psychic.username} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="bio" className="text-right">Bio</Label>
                                  <Textarea id="bio" defaultValue={psychic.bio} className="col-span-3" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="brand"
                                  type="submit"
                                  onClick={() => {
                                    const updatedData = {
                                      name: document.getElementById('name').value,
                                      bio: document.getElementById('bio').value
                                    };
                                    handleUpdate(psychic._id, updatedData);
                                  }}
                                  disabled={isUploading}
                                >
                                  {isUploading ? "Saving..." : "Save changes"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="default"><DollarSign /></Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Credits to {psychic.username}</DialogTitle>
                                <DialogDescription>
                                  Enter the amount of credits to add to this user's account
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="credits" className="text-right">Credits</Label>
                                  <Input
                                    id="credits"
                                    type="number"
                                    value={creditsToAdd}
                                    onChange={(e) => setCreditsToAdd(e.target.value)}
                                    className="col-span-3"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="brand"
                                  onClick={() => handleAddCredits(psychic._id)}
                                  disabled={isAddingCredits || !creditsToAdd || creditsToAdd <= 0}
                                >
                                  {isAddingCredits ? "Adding..." : "Add Credits"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" onClick={() => handleDelete(psychic._id)}><Trash /></Button>
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

export default AllUsers;