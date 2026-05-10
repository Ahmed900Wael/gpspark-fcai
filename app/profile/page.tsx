"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { User, Mail, GraduationCap, BookOpen, Target, Edit2, Save, X, LogOut } from "lucide-react";

export default function Profile() {
  const { user, signOut, updateProfile, supabaseUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    universityEmail: "",
    gpa: "",
    academicYear: "",
    interests: [] as string[],
    careerGoals: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        universityEmail: user.universityEmail,
        gpa: user.gpa,
        academicYear: user.academicYear,
        interests: user.interests,
        careerGoals: user.careerGoals,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    console.log("[CLIENT] Saving profile changes:", formData);
    const { error } = await updateProfile(formData);
    if (error) {
      console.log("[CLIENT] Profile update failed:", error);
    } else {
      console.log("[CLIENT] Profile updated successfully");
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        universityEmail: user.universityEmail,
        gpa: user.gpa,
        academicYear: user.academicYear,
        interests: user.interests,
        careerGoals: user.careerGoals,
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    console.log("[CLIENT] User logging out");
    await signOut();
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const interestOptions = ["AI & ML", "Web Dev", "Cybersecurity", "Mobile Apps", "Big Data", "Cloud Systems"];

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar activePage="/profile" />

        <div className="lg:ml-64 flex flex-col min-h-screen">
          <SimpleHeader />

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Profile</h1>
                  <p className="text-slate-600 mt-1">Manage your account information and preferences</p>
                </div>
                <div className="flex gap-3">
                  {!isEditing ? (
                    <>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="border-slate-200"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleCancel} variant="outline" className="border-slate-200">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
                  <p className="text-slate-500 text-sm mt-1">{user.academicYear}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">Member since</p>
                    <p className="text-sm text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-900">{user.fullName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">University Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.universityEmail}
                          onChange={(e) => setFormData({ ...formData, universityEmail: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-slate-900">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {user.universityEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Academic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Current GPA</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.gpa}
                          onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                          placeholder="4.00"
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-900">{user.gpa || "Not set"}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Academic Year</label>
                      {isEditing ? (
                        <select
                          value={formData.academicYear}
                          onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Senior (Capstone Ready)</option>
                          <option>Junior</option>
                          <option>Sophomore</option>
                        </select>
                      ) : (
                        <p className="text-slate-900">{user.academicYear || "Not set"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Areas of Interest
                  </h3>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            formData.interests.includes(interest)
                              ? "bg-blue-900 border-blue-900 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.interests.length > 0 ? (
                        user.interests.map((interest) => (
                          <span key={interest} className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">No interests selected</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Career Goals */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Career Goals
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={formData.careerGoals}
                      onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
                      placeholder="Describe your career aspirations..."
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <p className="text-slate-700 whitespace-pre-line">
                      {user.careerGoals || "No career goals set yet."}
                    </p>
                  )}
                </div>
              </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
    </ProtectedRoute>
  );
}
