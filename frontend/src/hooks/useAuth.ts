import { useState } from "react";
import api from "../api";
import type { User } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const res = await api.post("/login", { email, password });
    const token = res.data.access_token;
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const userRes = await api.get<User>("/user");
    setUser(userRes.data);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const res = await api.post("/register", { name, email, password, password_confirmation: password, role });
    const token = res.data.access_token;
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const userRes = await api.get<User>("/user");
    setUser(userRes.data);
  };

  const logout = async () => {
    await api.post("/logout");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return { user, login, register, logout };
}