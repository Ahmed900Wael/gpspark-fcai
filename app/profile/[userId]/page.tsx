"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { User, Mail, GraduationCap, BookOpen, Target, ArrowLeft, MessageSquare } from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  universityEmail: string;
  gpa: string;
  academicYear: string;
  interests: string[];
  careerGoals: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, getUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = params.userId as string;

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("[CLIENT] Fetching profile for user:", userId);
      const data = await getUserProfile(userId);
      if (data) {
        setProfile(data);
        console.log("[CLIENT] Profile loaded:", data);
      } else {
        console.log("[CLIENT] User not found");
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [userId, getUserProfile]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <Sidebar activePage="" />
          <div className="lg:ml-64 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50">
          <Sidebar activePage="" />
          <div className="lg:ml-64 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h1>
              <p className="text-slate-600 mb-6">The user you're looking for doesn't exist.</p>
              <Link href="/team">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Team Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar activePage="" />

        <div className="lg:ml-64 flex flex-col min-h-screen">
          <SimpleHeader />

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <Link href="/team" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Team Search
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {isOwnProfile ? "My Profile" : `${profile.fullName}'s Profile`}
                  </h1>
                  <p className="text-slate-600 mt-1">
                    {isOwnProfile ? "Your account information" : "Student profile and interests"}
                  </p>
                </div>
                {!isOwnProfile && (
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
                  <p className="text-slate-500 text-sm mt-1">{profile.academicYear}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">Member since</p>
                    <p className="text-sm text-slate-700">
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Details - Limited View */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info - Limited */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <p className="text-slate-900">{profile.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">University Email</label>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {/* Show partial email for privacy */}
                        {profile.universityEmail.replace(/(.{2}).*(@.*)/, "$1***$2")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Info - Limited */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Academic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Academic Year</label>
                      <p className="text-slate-900">{profile.academicYear || "Not set"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">GPA</label>
                      <p className="text-slate-900">{profile.gpa || "Not shared"}</p>
                    </div>
                  </div>
                </div>

                {/* Interests - Public */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Areas of Interest
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.length > 0 ? (
                      profile.interests.map((interest) => (
                        <span key={interest} className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No interests listed</p>
                    )}
                  </div>
                </div>

                {/* Career Goals - Limited */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Career Goals
                  </h3>
                  {profile.careerGoals ? (
                    <p className="text-slate-700 whitespace-pre-line line-clamp-3">
                      {profile.careerGoals}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm">No career goals shared</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
