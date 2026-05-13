"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  fullName: string;
  universityEmail: string;
  gpa: string;
  academicYear: string;
  department: string;
  interests: string[];
  careerGoals: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  supabase: typeof import("@/lib/supabase").supabase;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error: string | null }>;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateAuthEmail: (newEmail: string) => Promise<{ error: string | null; requiresConfirmation: boolean }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage immediately
    const cachedSession = localStorage.getItem("gpspark_session");
    const cachedUser = localStorage.getItem("gpspark_user");
    
    if (cachedSession && cachedUser) {
      try {
        const parsedSession = JSON.parse(cachedSession);
        const parsedUser = JSON.parse(cachedUser);
        setSession(parsedSession);
        setSupabaseUser(parsedSession.user);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("gpspark_session");
        localStorage.removeItem("gpspark_user");
      }
    }

    // Verify session with Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setSupabaseUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setSession(null);
        setSupabaseUser(null);
        setUser(null);
        localStorage.removeItem("gpspark_session");
        localStorage.removeItem("gpspark_user");
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[SERVER] Auth state changed:", _event);
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session) {
        localStorage.setItem("gpspark_session", JSON.stringify(session));
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        localStorage.removeItem("gpspark_session");
        localStorage.removeItem("gpspark_user");
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("[SERVER] Fetching user profile for:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[SERVER] Error fetching profile:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          fullName: data.full_name,
          universityEmail: data.university_email,
          gpa: data.gpa || "",
          academicYear: data.academic_year || "",
          department: data.department || "",
          interests: data.interests || [],
          careerGoals: data.career_goals || "",
          avatarUrl: data.avatar_url,
          linkedinUrl: data.linkedin_url,
          githubUrl: data.github_url,
          createdAt: data.created_at,
        };
        console.log("[SERVER] User profile loaded:", profile);
        setUser(profile);
        localStorage.setItem("gpspark_user", JSON.stringify(profile));
      }
    } catch (err) {
      console.error("[SERVER] Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, profile: Partial<UserProfile>) => {
    try {
      console.log("[SERVER] Signing up user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profile.fullName,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        console.error("[SERVER] Sign up error:", error.message);
        return { error: error.message };
      }

      if (data.user) {
        // Update profile with additional data (trigger already created the basic profile)
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: profile.fullName || "",
            university_email: profile.universityEmail || email,
            gpa: profile.gpa || "",
            academic_year: profile.academicYear || "",
            department: profile.department || "",
            interests: profile.interests || [],
            career_goals: profile.careerGoals || "",
            linkedin_url: profile.linkedinUrl || "",
            github_url: profile.githubUrl || "",
          })
          .eq("id", data.user.id);

        if (profileError) {
          console.error("[SERVER] Profile update error:", profileError.message);
          return { error: profileError.message };
        }

        console.log("[SERVER] User signed up successfully:", data.user.id);
        return { error: null };
      }

      return { error: "Sign up failed" };
    } catch (err) {
      console.error("[SERVER] Sign up error:", err);
      return { error: "An unexpected error occurred" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[SERVER] Signing in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[SERVER] Sign in error:", error.message);
        return { error: error.message };
      }

      if (data.user) {
        console.log("[SERVER] User signed in successfully:", data.user.id);
        return { error: null };
      }

      return { error: "Sign in failed" };
    } catch (err) {
      console.error("[SERVER] Sign in error:", err);
      return { error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    try {
      console.log("[SERVER] Signing out user");
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      localStorage.removeItem("gpspark_user");
      localStorage.removeItem("gpspark_session");
      console.log("[SERVER] User signed out successfully");
    } catch (err) {
      console.error("[SERVER] Sign out error:", err);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      if (!supabaseUser) return { error: "Not authenticated" };

      console.log("[SERVER] Updating profile:", profile);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.fullName,
          university_email: profile.universityEmail,
          gpa: profile.gpa,
          academic_year: profile.academicYear,
          department: profile.department,
          interests: profile.interests,
          career_goals: profile.careerGoals,
          avatar_url: profile.avatarUrl,
          linkedin_url: profile.linkedinUrl,
          github_url: profile.githubUrl,
        })
        .eq("id", supabaseUser.id);

      if (error) {
        console.error("[SERVER] Profile update error:", error.message);
        return { error: error.message };
      }

      // Update local state
      const updatedProfile = { ...user, ...profile } as UserProfile;
      setUser(updatedProfile);
      localStorage.setItem("gpspark_user", JSON.stringify(updatedProfile));
      console.log("[SERVER] Profile updated successfully");
      return { error: null };
    } catch (err) {
      console.error("[SERVER] Profile update error:", err);
      return { error: "An unexpected error occurred" };
    }
  };

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[SERVER] Error fetching user profile:", error);
        return null;
      }

      return {
        id: data.id,
        fullName: data.full_name,
        universityEmail: data.university_email,
        gpa: data.gpa || "",
        academicYear: data.academic_year || "",
        department: data.department || "",
        interests: data.interests || [],
        careerGoals: data.career_goals || "",
        avatarUrl: data.avatar_url,
        linkedinUrl: data.linkedin_url,
        githubUrl: data.github_url,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error("[SERVER] Error fetching user profile:", err);
      return null;
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      console.log("[SERVER] Resending confirmation email to:", email);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        console.error("[SERVER] Resend confirmation error:", error.message);
        return { error: error.message };
      }

      console.log("[SERVER] Confirmation email resent successfully");
      return { error: null };
    } catch (err) {
      console.error("[SERVER] Resend confirmation error:", err);
      return { error: "An unexpected error occurred" };
    }
  };

  const updateAuthEmail = async (newEmail: string) => {
    try {
      if (!supabaseUser) return { error: "Not authenticated", requiresConfirmation: false };

      console.log("[SERVER] Updating auth email from", supabaseUser.email, "to", newEmail);
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        console.error("[SERVER] Auth email update error:", error.message);
        return { error: error.message, requiresConfirmation: false };
      }

      console.log("[SERVER] Auth email update initiated. Confirmation email sent to:", newEmail);
      return { error: null, requiresConfirmation: true };
    } catch (err) {
      console.error("[SERVER] Auth email update error:", err);
      return { error: "An unexpected error occurred", requiresConfirmation: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        supabase,
        isAuthenticated: !!supabaseUser,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        getUserProfile,
        updateAuthEmail,
        resendConfirmationEmail,
      }}
    >
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
