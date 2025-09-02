import React, { useState, useEffect } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, User } from "lucide-react";
import { useAuth } from "./AuthContext";

const cld = new Cloudinary({ cloud: { cloudName: "dovyqaltq" } });

export default function Signup() {
  const { register, user, loading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    birthTime: "",
    birthPlace: "",
    imageFile: null,
    imagePublicId: null,
    gender: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setFormErrors({ ...formErrors, [id]: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file, imagePublicId: null });
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!formData.dob) errors.dob = "Date of birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    return errors;
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ml_default");

    const res = await fetch("https://api.cloudinary.com/v1_1/dovyqaltq/image/upload", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Upload failed");
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.imagePublicId;

      if (formData.imageFile) {
        imageUrl = await uploadToCloudinary(formData.imageFile);
      }

      const payload = {
        firstName: formData.firstName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        dob: formData.dob,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        image: imageUrl || "",
        gender: formData.gender,
      };

      const result = await register(payload);
      if (result.success) {
        toast.success("Account created successfully!");
        setFormData({
          firstName: "",
          email: "",
          password: "",
          confirmPassword: "",
          dob: "",
          birthTime: "",
          birthPlace: "",
          imageFile: null,
          imagePublicId: null,
          gender: "",
        });
        setImagePreviewUrl(null);
        navigate("/numerology-report", { state: { numerologyReport: result.numerologyData } });
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Registration failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user && !error && !isSubmitting) {
      navigate("/numerology-report", { state: { numerologyReport: user.numerologyData } });
    }
    if (error) {
      toast.error(error);
    }
  }, [user, error, navigate, isSubmitting]);

  const cldImage = formData.imagePublicId
    ? cld
        .image(formData.imagePublicId)
        .format("auto")
        .quality("auto")
        .resize(auto().gravity(autoGravity()).width(80).height(80))
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Start jouw reis
          </CardTitle>
          <CardDescription className="text-center">
            Vul je exacte gegevens in voor jouw unieke blauwdruk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                  {cldImage ? (
                    <AdvancedImage cldImg={cldImage} />
                  ) : imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
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
                Upload Photo
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
              />
              {formErrors.firstName && (
                <div className="text-red-500 text-sm">{formErrors.firstName}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
              {formErrors.email && (
                <div className="text-red-500 text-sm">{formErrors.email}</div>
              )}
            </div>
<div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {formErrors.gender && (
                <div className="text-red-500 text-sm">{formErrors.gender}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                placeholder="Select date of birth"
                required
              />
              {formErrors.dob && (
                <div className="text-red-500 text-sm">{formErrors.dob}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthTime">Birth Time (Optional)</Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={handleChange}
                placeholder="Enter birth time (e.g., 14:30)"
                
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthPlace">Place of Birth </Label>
              <Input
                id="birthPlace"
                type="text"
                value={formData.birthPlace}
                onChange={handleChange}
                placeholder="Enter place of birth"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                required
              />
              {formErrors.password && (
                <div className="text-red-500 text-sm">{formErrors.password}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              {formErrors.confirmPassword && (
                <div className="text-red-500 text-sm">{formErrors.confirmPassword}</div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="brand"
              className="w-full mt-6 relative bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                  Generating Report...
                </div>
              ) : (
                "Ontvang mijn blauwdruk"
              )}
              
              {/* Progress bar background */}
              {isSubmitting && (
                <div className="absolute bottom-0 left-0 h-1 bg-blue-300 w-full"></div>
              )}
              
              {/* Animated progress bar */}
              {isSubmitting && (
                <div className="absolute bottom-0 left-0 h-1 bg-blue-100 w-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/2 animate-[progressBar_1.5s_ease-in-out_infinite]"></div>
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Add CSS animation for progress bar */}
      <style>
        {`
          @keyframes progressBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}
      </style>
    </div>
  );
}