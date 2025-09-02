import { useState } from 'react';
import Dashboard_Navbar from './Admin_Navbar';
import Doctor_Side_Bar from './SideBar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useAdminAuth } from '@/context/AdminAuthContext';

const Add_Advisor = () => {
  const { admin } = useAdminAuth();

  const [side, setSide] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    image: "",
    type: "",
    systemPrompt: "",
    rate: {
      perMinute: 5,
      perMessage: 3
    },
    abilities: "",
    requiredFields: ["name", "birthDate"]
  });

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ml_default");
    
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dovyqaltq/image/upload", {
        method: "POST",
        body: data,
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Upload failed");
      return json.secure_url;
    } catch (error) {
      toast.error("Image upload failed: " + error.message);
      throw error;
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      // Remove the manual image URL input when uploading a file
      setForm(prev => ({ ...prev, image: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "perMinute" || name === "perMessage") {
      setForm(prev => ({
        ...prev,
        rate: {
          ...prev.rate,
          [name]: parseFloat(value)
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear preview if manually entering URL
      if (name === "image" && value) {
        setImagePreviewUrl(null);
        setImageFile(null);
      }
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Upload image if a file is selected
    let imageUrl = form.image;
    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
    }

    if (!imageUrl) {
      throw new Error("Please upload an image or enter image URL");
    }

    const payload = {
      ...form,
      image: imageUrl,
      abilities: form.abilities
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0),
      requiredFields: form.requiredFields,
    };

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/psychics/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ This sends cookies (admin_token)
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Psychic advisor added successfully");
      resetForm();
    } else {
      toast.error(data?.message || "Something went wrong while adding");
    }
  } catch (err) {
    console.error("Submission error:", err);
    toast.error(err.message || "Error submitting form");
  } finally {
    setIsLoading(false);
  }
};

  const resetForm = () => {
    setForm({
      name: "",
      bio: "",
      image: "",
      type: "",
      systemPrompt: "",
      rate: { perMinute: 5, perMessage: 3 },
      abilities: "",
      requiredFields: ["name", "birthDate"]
    });
    setImagePreviewUrl(null);
    setImageFile(null);
  };

  const user = {
    name: "Admin",
    email: "admin@gmail.com",
    profile: "https://avatars.example.com/admin.jpg"
  };

  return (
    <div>
      <Dashboard_Navbar side={side} setSide={setSide} user={admin} />
      <div className="dashboard-wrapper">
        <Doctor_Side_Bar side={side} setSide={setSide} user={admin} />
        <div className="dashboard-side min-h-screen">
          <h2 className="text-3xl font-bold text-center my-6">Add AI Psychic Advisor</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto p-4 border rounded-md border-gray-200">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-24 h-24">
                <div className="w-full h-full rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                  {imagePreviewUrl ? (
                    <img 
                      src={imagePreviewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : form.image ? (
                    <img 
                      src={form.image} 
                      alt="Current" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">No Image</div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="profile-image"
                  onChange={handleImageChange}
                />
              </div>
              <Label
                htmlFor="profile-image"
                className="text-sm text-gray-600 cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                {imageFile ? "Change Image" : "Upload Image"}
              </Label>
            </div>

            {/* Image URL Input (alternative to upload) */}
            <div className="space-y-2">
              <Label htmlFor="image">Or enter image URL</Label>
              <Input 
                type="text" 
                name="image" 
                value={form.image} 
                onChange={handleChange} 
                placeholder="Enter image URL" 
                disabled={!!imageFile}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Enter advisor name" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Category *</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm({ ...form, type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Love">Love</SelectItem>
                  <SelectItem value="Astrology">Astrology</SelectItem>
                  <SelectItem value="Numerology">Numerology</SelectItem>
                  <SelectItem value="Tarot">Tarot</SelectItem>
                </SelectContent>
              </Select>
              {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea 
                name="bio" 
                value={form.bio} 
                onChange={handleChange} 
                placeholder="Enter advisor bio" 
                required 
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt *</Label>
              <Textarea 
                name="systemPrompt" 
                value={form.systemPrompt} 
                onChange={handleChange} 
                placeholder="Enter the AI system prompt that defines how the advisor should behave" 
                required 
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="perMinute">Rate Per Minute ($) *</Label>
                <Input 
                  type="number" 
                  name="perMinute" 
                  value={form.rate.perMinute} 
                  onChange={handleChange} 
                  min="0" 
                  step="0.01" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perMessage">Rate Per Message ($) *</Label>
                <Input 
                  type="number" 
                  name="perMessage" 
                  value={form.rate.perMessage} 
                  onChange={handleChange} 
                  min="0" 
                  step="0.01" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="abilities">Abilities</Label>
              <Input
                type="text"
                name="abilities"
                value={form.abilities}
                onChange={handleChange}
                placeholder="e.g. Clairvoyant, Crystal Energy, Medium"
              />
              <p className="text-sm text-gray-500">Separate abilities with commas</p>
            </div>

            <Button 
              type="submit" 
              variant="brand" 
              className="w-full"
              disabled={isLoading || isSaving}
            >
              {isLoading ? "Adding..." : "Add Advisor"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add_Advisor;