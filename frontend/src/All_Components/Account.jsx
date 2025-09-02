import Navigation from "./Navigator";
import {  Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "./screen/AuthContext";
import { toast } from "sonner";
import { Cloudinary } from "@cloudinary/url-gen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CameraIcon } from "lucide-react";
import axios from "axios";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Account = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(0);
  const fee = 0.5;
  const total = amount + fee;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    dob: "",
    bio: "",
    birthTime:"",
    imageFile: null,
    imagePublicId: null,
    currentImage: null, // Store the current image URL
  });
  const [credits, setCredits] = useState(0);
  const [payments, setPayments] = useState([]);
  const cld = new Cloudinary({ cloud: { cloudName: "dovyqaltq" } });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const formatDateOnly = (dobObj) => {
    if (!dobObj) return "";
    if (typeof dobObj === "string") return dobObj.slice(0, 10);
    if (dobObj.$date) return dobObj.$date.slice(0, 10);
    if (dobObj instanceof Date) return dobObj.toISOString().slice(0, 10);
    return "";
  };

  const extractPublicId = (url) => {
    if (!url) return null;
    const match = url.match(/\/v\d+\/([^/]+)\.\w+$/);
    return match ? match[1] : null;
  };

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
    } catch (err) {
      throw new Error("Image upload failed: " + err.message);
    }
  };

  useEffect(() => {
    if (!user || !user._id) return;

    setIsLoading(true);
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/users/user/${user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        const data = res.data.user;
        setFormData({
          username: data.username || "",
          email: data.email || "",
          dob: formatDateOnly(data.dob) || "",
          bio: data.bio || "",
          birthTime:data.birthTime || "",
          imageFile: null,
          imagePublicId: extractPublicId(data.image) || null,
          currentImage: data.image || null, // Store the current image URL
        });
        setCredits(data.credits || 0);
        setPayments(data.payments || []);
        setImagePreviewUrl(data.image || null);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to fetch user profile");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user?._id, user?.token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file, imagePublicId: null });
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let publicId = formData.imagePublicId;

      if (formData.imageFile) {
        // Upload new image only if a new file is selected
        publicId = await uploadToCloudinary(formData.imageFile);
        setFormData((prev) => ({ ...prev, imagePublicId: extractPublicId(publicId) }));
        setImagePreviewUrl(null);
      }

      // Build payload dynamically, only including fields that should be updated
      const payload = {
        username: formData.username || undefined,
        email: formData.email || undefined,
        dob: formData.dob || undefined,
        birthTime: formData.birthTime || undefined,
        bio: formData.bio || undefined,
      };

      // Only include image if a new image was uploaded
      if (formData.imageFile && publicId) {
        payload.image = publicId;
      } else if (formData.currentImage) {
        // Retain existing image if no new image is uploaded
        payload.image = formData.currentImage;
      }

      // Remove undefined fields from payload
      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/users/update-user/${user._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      toast.success(response.data.message || "Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      return toast.error("User not logged in");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/update-password/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cldImage = formData.imagePublicId
    ? cld
        .image(formData.imagePublicId)
        .format("auto")
        .quality("auto")
        .resize(auto().gravity(autoGravity()).width(128).height(128))
    : null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!user || !user._id || (isLoading && !formData.username)) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4">
      <div className="max-w-7xl mx-auto pb-10">
        <Navigation />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm rounded-sm border border-gray-200">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account settings and profile information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-8">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        {cldImage ? (
                          <AdvancedImage cldImg={cldImage} />
                        ) : imagePreviewUrl ? (
                          <AvatarImage src={imagePreviewUrl} alt="Preview" />
                        ) : (
                          <AvatarFallback>{formData.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        )}
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer"
                      >
                        <CameraIcon className="h-5 w-5" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="johndoe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john.doe@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                   <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Birth Time</Label>
                      <Input
                        id="birthTime"
                        type="time"
                        value={formData.birthTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none min-h-[120px]"
                    />
                  </div>

                  <div className="flex justify-end ">
                    <Button
  type="submit"
  disabled={isLoading}
  className="bg-[#3B5EB7] text-white hover:bg-[#334fa1] transition-colors duration-200"
>
  {isLoading && <Loader2 className="mr-2 h-4 w-4" />}
  Save Changes
</Button>

                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-sm border border-gray-200">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Enter your current password and choose a new password</CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        className="pr-10"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <Eye />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        className="pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <Eye />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Password Repeat</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        className="pr-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <Eye />
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="mt-2">
                  <Button variant="brand" type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating..." : "Change Password"}
                    <Lock className="mr-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="shadow-sm rounded-sm border border-gray-200">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="credits" className="border-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                    <span className="text-lg font-medium">Credits</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    {credits > 0 ? (
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-primary">Balance: {credits} Credits</p>
                        <p className="text-sm text-muted-foreground">Use credits for premium consultations.</p>
                        <Button variant="brand" className="mt-2">Add Credits</Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No credits available</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payments" className="border-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                    <span className="text-lg font-medium">Payment History</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    {payments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment, index) => (
                            <TableRow key={payment.molliePaymentId || index}>
                              <TableCell>{formatDate(payment.createdAt)}</TableCell>
                              <TableCell>{payment.planName || "N/A"}</TableCell>
                              <TableCell>€{payment.amount.toFixed(2)}</TableCell>
                              <TableCell>{payment.creditsPurchased}</TableCell>
                              <TableCell className="capitalize">{payment.paymentMethod.replace("_", " ")}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-gray-400">No payment history available</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

              
              </Accordion>
            </Card>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default Account;