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
import { ChevronDown, Edit, Star, StarHalf, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { uploadToCloudinary } from "@/utils/cloudinary"; // create this util or copy from Signup

const AllAdvisors = () => {
    const [side, setSide] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [psychics, setPsychics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bio, setBio] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [currentPsychic, setCurrentPsychic] = useState(null);
    const [editData, setEditData] = useState({
      name: '',
      bio: '',
      type: '',
      image: '',
      systemPrompt:''
    });

    const formatDate = (date) => {
      if (!date) return "Not provided";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const handleBio = (bioo) => {
      setBio(bioo);
    };

    const user = {
        name: "User",
        email: "user@gmail.com",
        profile: "https://avatars.mds.yandex.net/i?id=93f523ab7f890b9175f222cd947dc36ccbd81bf7-9652646-images-thumbs&n=13"
    };

    const renderRating = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
          if (i <= rating) {
            stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
          } else if (i - 0.5 === rating) {
            stars.push(<StarHalf key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
          } else {
            stars.push(<Star key={i} className="h-4 w-4 text-muted-foreground" />);
          }
        }
        return <div className="flex">{stars}</div>;
    };

    // Fetch all psychics from API
    const fetchPsychics = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/psychics`);
        setPsychics(response.data.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error("Failed to fetch advisors");
      }
    };

    useEffect(() => {
      setIsLoaded(true);
      fetchPsychics();
    }, []);

    // Handle image upload to Cloudinary
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
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
        return null;
      }
    };

    // Delete psychic handler
    const handleDelete = async (id) => {
      try {
        await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/psychics/${id}`);
        toast.success("Advisor deleted successfully");
        fetchPsychics(); // Refresh the list
      } catch (err) {
        toast.error("Failed to delete advisor");
      }
    };


const handleUpdate = async (id) => {
  try {
    setIsUploading(true);

    let updatedData = { ...editData };

    if (imageFile) {
      const imageUrl = await uploadToCloudinary(imageFile);
      if (imageUrl) {
        updatedData.image = imageUrl;
      }
    }

    await axios.put(`${import.meta.env.VITE_BASE_URL}/api/psychics/${id}`, updatedData);
    toast.success("Advisor updated successfully");
    fetchPsychics();

    // Reset
    setImageFile(null);
    setImagePreview("");
    setCurrentPsychic(null);
  } catch (err) {
    toast.error("Failed to update advisor");
  } finally {
    setIsUploading(false);
  }
};

    // Handle image selection
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    };

    // Set current psychic when edit is clicked
    const handleEditClick = (psychic) => {
      setCurrentPsychic(psychic);
      setEditData({
        name: psychic.name,
        bio: psychic.bio,
        type: psychic.type,
        image: psychic.image,
        systemPrompt:psychic.systemPrompt
      });
      setImagePreview(psychic.image);
    };

    if (loading) {
      return (
        <div>
          <Dashboard_Navbar side={side} setSide={setSide} user={user}/>
          <div className="dashboard-wrapper">
            <Doctor_Side_Bar side={side} setSide={setSide} user={user}/>
            <div className="dashboard-side min-h-screen flex items-center justify-center">
              <p>Loading advisors...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div>
          <Dashboard_Navbar side={side} setSide={setSide} user={user}/>
          <div className="dashboard-wrapper">
            <Doctor_Side_Bar side={side} setSide={setSide} user={user}/>
            <div className="dashboard-side min-h-screen flex items-center justify-center">
              <p className="text-red-500">Error: {error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div>
          <Dashboard_Navbar side={side} setSide={setSide} user={user}/>
        </div>
        <div className="dashboard-wrapper">
          <Doctor_Side_Bar side={side} setSide={setSide} user={user}/>
          <div className="dashboard-side min-h-screen">       
            <h2 className='text-2xl md:text-3xl lg:text-4xl font-sans font-extrabold text-center my-6'>All Advisors</h2>
            <div className="mx-2 md:mx-4">
              <Card
                className={`w-full bg-white/10 border border-gray-200 backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:translate-y-[-5px] ${isLoaded ? "animate-slide-in-bottom opacity-100" : "opacity-0"}`}
                style={{ animationDelay: "1.3s" }}
              >
                <CardHeader className="flex flex-row items-center">
                  <div className="grid gap-2">
                    <CardTitle>Advisors data</CardTitle>
                    <CardDescription>All Advisors in the platform</CardDescription>
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
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {psychics.map((psychic, index) => (
                        <TableRow
                          key={psychic._id}
                          className={`transition-all duration-300 hover:scale-[1.01] ${isLoaded ? "animate-slide-in-right opacity-100" : "opacity-0"}`}
                          style={{ animationDelay: `${1.4 + index * 0.1}s` }}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <img 
                                src={psychic.image || "/images/default-profile.jpg"} 
                                alt="profile" 
                                className="w-10 h-10 rounded-full object-cover" 
                              />
                            </div>
                          </TableCell>
                          <TableCell>{psychic.name}</TableCell>
                          <TableCell>
                            {psychic.bio?.slice(0, 20)}...
                            <Dialog>
                              <DialogTrigger asChild>
                                <span 
                                  onClick={() => handleBio(psychic.bio)} 
                                  className='text-cyan-500 hover:underline cursor-pointer'
                                >
                                  See More
                                </span>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Full Bio</DialogTitle>
                                  <DialogDescription>
                                    {bio}
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell>{psychic.type}</TableCell>
                          <TableCell>{formatDate(psychic.createdAt)}</TableCell>
                          <TableCell>
                            {renderRating(psychic.rating?.avgRating || 0)}
                            <span className="text-xs text-gray-500 ml-1">
                              ({psychic.rating?.ratingCount || 0} reviews)
                            </span>
                          </TableCell>
                          <TableCell className="text-right flex items-center gap-2 justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="brand"
                                  onClick={() => handleEditClick(psychic)}
                                >
                                  <Edit/>
                                </Button>
                              </DialogTrigger>
      {currentPsychic && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Advisor</DialogTitle>
            <DialogDescription>
              Update advisor details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-4">
                  <img 
                    src={imagePreview || currentPsychic.image || "/images/default-profile.jpg"} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full object-cover" 
                  />
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="col-span-3" 
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input 
                id="name" 
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Textarea 
                id="bio" 
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                className="col-span-3" 
              />
            </div>

             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Prompt
              </Label>
              <Textarea 
                id="bio" 
                value={editData.systemPrompt}
                onChange={(e) => setEditData({...editData, systemPrompt: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Category
              </Label>
              <Select 
                value={editData.type}
                onValueChange={(value) => setEditData({...editData, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Love">Love</SelectItem>
                  <SelectItem value="Astrology">Astrology</SelectItem>
                  <SelectItem value="Numerology">Numerology</SelectItem>
                  <SelectItem value="Tarot">Tarot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="brand" 
              type="submit"
              onClick={() => handleUpdate(currentPsychic._id)}
              disabled={isUploading}
            >
              {isUploading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
                            </Dialog>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDelete(psychic._id)}
                            >
                              <Trash/>
                            </Button>
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

export default AllAdvisors;