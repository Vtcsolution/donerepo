import React, { useState } from "react";
import { toast } from "sonner";
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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Signin() {
  const { login, user, loading, error } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.id]: e.target.value,
    });
  };

 // Signin.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Submitting form with:", credentials);
  try {
    const result = await login(credentials);
    console.log("Login result:", result);
    if (result?.success) {
      toast.success("Login successful");
      console.log("Navigating to / after successful login");
      navigate("/", { replace: true });
    } else {
      toast.error(result?.message || "Login failed");
    }
  } catch (err) {
    console.error("Form submission error:", err);
    toast.error("An unexpected error occurred");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your details to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="brand"
              className="w-full mt-6"
              size="lg"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="text-end my-2">
            <Link
              to="/forgot-password"
              className="text-[#3B5EB7] hover:underline font-medium"
            >
              Forgot Password
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            No account?{" "}
            <Link
              to="/register"
              className="text-[#3B5EB7] hover:underline font-medium"
            >
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}