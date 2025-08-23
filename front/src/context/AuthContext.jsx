 
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

// fiksiraj bazni URL
axios.defaults.baseURL = "http://127.0.0.1:8000/api";


const initialToken = localStorage.getItem("token");
if (initialToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${initialToken}`;
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(initialToken);

  // i dalje sync-uj kad se token promeni
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common.Authorization;
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = (u, t) => {
    setUser(u);
    setToken(t);
  };

  const logout = async () => {
    try { await axios.post("/auth/logout"); } catch { /* ignoriši */ }
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuth: !!token, login, logout }),
    [user, token]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
