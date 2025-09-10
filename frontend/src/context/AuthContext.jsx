import { createContext, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BASE_URL;
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem('token');


  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      // Rehydrate user from localStorage
      setCurrentUser({ role });
    }

    setLoading(false); // Done checking
  }, []);

  const register = async (formData, resetForm) => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registered successfully!");
        resetForm();
        navigate("/login"); // redirect to login
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error("Something went wrong");
    }
    finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setCurrentUser({ ...data.user, role: data.role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      return data;
    } catch (err) {
      // Re-throw to surface in Login.jsx
      throw err;
    }
  };

  // Admin login
  const adminLogin = async ({ email, password }) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Admin login failed');
      }
      setCurrentUser({ ...data.user, role: data.role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ register, loading, token, logout, login, adminLogin, currentUser }}>
      {children}
      {loading && <Loader />}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
