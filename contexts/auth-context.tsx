"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserProfile {
  fullName: string;
  universityEmail: string;
  gpa: string;
  academicYear: string;
  interests: string[];
  careerGoals: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("gpspark_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
        console.log("[SERVER] User session restored:", parsed);
      } catch (e) {
        localStorage.removeItem("gpspark_user");
      }
    }
  }, []);

  const login = (profile: UserProfile) => {
    console.log("[SERVER] User authenticated:", profile);
    setUser(profile);
    setIsAuthenticated(true);
    localStorage.setItem("gpspark_user", JSON.stringify(profile));
  };

  const logout = () => {
    console.log("[SERVER] User logged out");
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("gpspark_user");
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    const updated = { ...user, ...profile } as UserProfile;
    console.log("[SERVER] Profile updated:", updated);
    setUser(updated);
    localStorage.setItem("gpspark_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
