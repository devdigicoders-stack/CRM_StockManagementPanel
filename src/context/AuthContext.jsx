import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const USER_KEY = "stock-data";
const TOKEN_KEY = "stock-token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved stock user data", e);
        localStorage.removeItem(USER_KEY);
      }
    }

    if (savedToken) {
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  const setLoginData = (userData) => {
    const allowedRoles = ["stock", "superAdmin", "admin"];
    if (userData.user && !allowedRoles.includes(userData.user.role)) {
      console.warn("Blocked: Only stock managers or admins are allowed.");
      return false;
    }
    setUser(userData.user);
    setToken(userData.token);

    localStorage.setItem(USER_KEY, JSON.stringify(userData.user));
    if (userData.token) {
      localStorage.setItem(TOKEN_KEY, userData.token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const isLoggedIn = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{ user, token, setLoginData, logout, isLoggedIn, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
