"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { useNotification } from "@/contexts/notification-context";
import { User, Mail, GraduationCap, BookOpen, Target, Edit2, Save, X, LogOut, AlertCircle, CheckCircle2, Camera, Loader2 } from "lucide-react";
import { uploadAvatar, validateFile } from "@/lib/upload";

export default function Profile() {
  const { user, signOut, updateProfile, supabaseUser, updateAuthEmail } = useAuth();
  const { addNotification } = useNotification();
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authEmail, setAuthEmail] = useState("");
  const [newAuthEmail, setNewAuthEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
      setAuthEmail(supabaseUser?.email || user.universityEmail);
    }
  }, [user, supabaseUser]);

  const handleSave = async () => {
    setIsSaving(true);
    console.log("[CLIENT] Saving profile changes:", formData);
    const { error } = await updateProfile(formData);
    if (error) {
      console.log("[CLIENT] Profile update failed:", error);
      addNotification("error", "Update Failed", error);
    } else {
      console.log("[CLIENT] Profile updated successfully");
      setIsEditing(false);
      addNotification("success", "Profile Updated", "Your profile information has been saved successfully.");
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

  const handleUpdateEmail = async () => {
    if (!newAuthEmail.trim()) {
      addNotification("error", "Invalid Email", "Please enter a new email address.");
      return;
    }
    if (newAuthEmail === authEmail) {
      addNotification("error", "No Change", "New email must be different from current email.");
      return;
    }

    setIsSavingEmail(true);
    setEmailStatus(null);
    console.log("[CLIENT] Updating auth email to:", newAuthEmail);

    const { error, requiresConfirmation } = await updateAuthEmail(newAuthEmail);

    if (error) {
      setEmailStatus({ type: "error", message: error });
      addNotification("error", "Email Update Failed", error);
    } else if (requiresConfirmation) {
      setEmailStatus({ type: "success", message: `Confirmation email sent to ${newAuthEmail}. Check your inbox and click the link to verify.` });
      addNotification("success", "Verification Sent", `A confirmation email has been sent to ${newAuthEmail}. Click the link to verify before signing in with the new email.`);
      setAuthEmail(newAuthEmail);
      setIsEditingEmail(false);
      setNewAuthEmail("");
    }
    setIsSavingEmail(false);
  };

  const handleCancelEmailEdit = () => {
    setIsEditingEmail(false);
    setNewAuthEmail("");
    setEmailStatus(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    });

    if (!validation.valid) {
      addNotification("error", "Invalid File", validation.error || "Invalid file");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarPreview(URL.createObjectURL(file));

    const { url, error } = await uploadAvatar(user.id, file);

    if (error) {
      addNotification("error", "Upload Failed", error);
      setAvatarPreview(null);
    } else if (url) {
      await updateProfile({ avatarUrl: url });
      addNotification("success", "Avatar Updated", "Your profile picture has been updated.");
    }

    setIsUploadingAvatar(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {avatarPreview || user.avatarUrl ? (
                      <img
                        src={avatarPreview || user.avatarUrl || ""}
                        alt={user.fullName}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                        {user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center hover:bg-blue-800 disabled:opacity-50 transition-colors"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
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

                {/* Login Email */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Login Email
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">This is the email you use to sign in. Changing it requires email verification.</p>
                  
                  {emailStatus && (
                    <div className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
                      emailStatus.type === "success" 
                        ? "bg-green-50 border border-green-200 text-green-700" 
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}>
                      {emailStatus.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{emailStatus.message}</span>
                    </div>
                  )}

                  {!isEditingEmail ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{authEmail}</span>
                      </div>
                      <Button
                        onClick={() => setIsEditingEmail(true)}
                        variant="outline"
                        className="border-slate-200 text-sm"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Change Email
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={newAuthEmail}
                        onChange={(e) => setNewAuthEmail(e.target.value)}
                        placeholder="Enter new email"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdateEmail}
                          disabled={isSavingEmail || !newAuthEmail.trim()}
                          className="bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-50"
                        >
                          {isSavingEmail ? "Sending..." : "Update Email"}
                        </Button>
                        <Button onClick={handleCancelEmailEdit} variant="outline" className="border-slate-200">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
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
