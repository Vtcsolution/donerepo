import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.withCredentials = true;
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
          console.log("401 error detected, attempting token refresh");
          error.config._retry = true;
          try {
            const { data } = await axios.post(
              `${import.meta.env.VITE_BASE_URL}/api/users/refresh`,
              {},
              { withCredentials: true }
            );
            if (data.token) {
              localStorage.setItem("accessToken", data.token);
              error.config.headers.Authorization = `Bearer ${data.token}`;
              return axios(error.config);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            localStorage.removeItem("accessToken");
            setUser(null);
            setError("Session expired. Please log in again.");
            navigate("/login");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }, [navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          setUser(null);
          return;
        }
        const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log("Auth check successful, setting user:", data.user);
        setUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("accessToken");
        setUser(null);
        setError("Authentication failed. Please log in.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    setUser(null); // Clear user state to force refresh
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/login`,
        credentials,
        { withCredentials: true }
      );
      if (data.token && data.user) {
        localStorage.setItem("accessToken", data.token);
        setUser(data.user);
        console.log("Login successful, user set:", data.user);
        return { success: true };
      } else {
        throw new Error("Invalid login response");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      console.error("Login failed:", msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/register`,
        payload,
        { withCredentials: true }
      );
      if (data.token && data.user) {
        localStorage.setItem("accessToken", data.token);
        setUser(data.user);
        console.log("Registration successful, user set:", data.user);
        return { success: true };
      } else {
        throw new Error("Invalid register response");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      console.error("Registration failed:", msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setError(null);
    console.log("Logout successful, navigating to /login");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}