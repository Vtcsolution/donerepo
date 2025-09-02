// context/AdminAuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true); // ⬅️ Add loading state

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/admin/profile`, {
          withCredentials: true,
        });
        setAdmin(res.data);
      } catch (err) {
        setAdmin(null);
      } finally {
        setLoading(false); // ⬅️ Mark loading complete
      }
    };

    fetchAdmin();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
