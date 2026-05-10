"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ArrowRight, ArrowLeft, Check, Brain, Globe, Shield, Lock, HelpCircle } from "lucide-react";

const steps = [
  { number: 1, title: "Account Identity", status: "current" },
  { number: 2, title: "Academic Profile", status: "pending" },
  { number: 3, title: "Interests & Goals", status: "pending" },
];

const interestOptions = [
  { id: "ai-ml", label: "AI & ML", icon: Brain },
  { id: "web-dev", label: "Web Dev", icon: Globe },
  { id: "cybersecurity", label: "Cybersecurity", icon: Shield },
  { id: "mobile", label: "Mobile Apps", icon: "📱" },
  { id: "big-data", label: "Big Data", icon: "📊" },
  { id: "cloud", label: "Cloud Systems", icon: "☁️" },
];

export default function Onboarding() {
  const router = useRouter();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    universityEmail: "",
    gpa: "",
    academicYear: "Senior (Capstone Ready)",
    interests: [] as string[],
    careerGoals: "",
  });

  const updateStepStatus = () => {
    return steps.map((step) => ({
      ...step,
      status: step.number < currentStep ? "completed" : step.number === currentStep ? "current" : "pending",
    }));
  };

  const updatedSteps = updateStepStatus();

  const handleNext = () => {
    if (currentStep < 3) {
      console.log(`[CLIENT] Step ${currentStep} completed:`, formData);
      setCurrentStep(currentStep + 1);
    } else {
      console.log("[CLIENT] Onboarding completed. Full profile:", formData);
      console.log("[SERVER] Authenticating user with profile:", formData);
      login({
        fullName: formData.fullName,
        universityEmail: formData.universityEmail,
        gpa: formData.gpa,
        academicYear: formData.academicYear,
        interests: formData.interests,
        careerGoals: formData.careerGoals,
      });
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() !== "" && formData.universityEmail.trim() !== "";
      case 2:
        return formData.gpa.trim() !== "" && formData.academicYear !== "";
      case 3:
        return formData.interests.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-8">
        <div className="flex h-16 w-16 items-center justify-center mb-6">
          <img src="/logo.svg" alt="GPSpark Logo" className="w-16 h-16" />
        </div>
        <p className="text-slate-600 text-lg">
          Your journey toward a premium graduation project starts here.
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-4xl pb-16">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar - Progress */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">
                Setup Progress
              </h3>
              <div className="space-y-4">
                {updatedSteps.map((step, index) => (
                  <div key={step.number} className="flex items-start gap-3">
                    <div className="relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.status === "completed"
                            ? "bg-green-600 text-white"
                            : step.status === "current"
                            ? "bg-blue-900 text-white"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          step.number
                        )}
                      </div>
                      {index < updatedSteps.length - 1 && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-200"></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Step {step.number}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          step.status === "current"
                            ? "text-slate-900"
                            : "text-slate-600"
                        }`}
                      >
                        {step.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-6 text-white">
              <div className="text-xs font-medium text-blue-200 uppercase tracking-wide mb-2">
                GPSpark Insight
              </div>
              <p className="text-sm leading-relaxed">
                Students who complete their profile are{" "}
                <span className="font-semibold">40% more likely</span> to find
                compatible teammates within the first week.
              </p>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12">
            {/* Step 1: Account Identity */}
            {currentStep === 1 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                    Create Your Account
                  </h2>
                  <p className="text-slate-600">
                    Let's start with your basic identity information.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      University Email
                    </label>
                    <input
                      type="email"
                      value={formData.universityEmail}
                      onChange={(e) => setFormData({ ...formData, universityEmail: e.target.value })}
                      placeholder="j.doe@fcai.edu"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                      ← Back to Home
                    </Link>
                    <Button
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Academic Profile */}
            {currentStep === 2 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                    Build Your Academic Profile
                  </h2>
                  <p className="text-slate-600">
                    Help us understand your background to tailor project recommendations for you.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Current GPA
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.gpa}
                          onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                          placeholder="4.00"
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          📊
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Academic Year
                      </label>
                      <select
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option>Senior (Capstone Ready)</option>
                        <option>Junior</option>
                        <option>Sophomore</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <Button variant="ghost" onClick={handleBack} className="text-slate-600 hover:text-slate-900">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Identity
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Interests
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: Interests & Goals */}
            {currentStep === 3 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                    Interests & Goals
                  </h2>
                  <p className="text-slate-600">
                    Tell us about your interests and career aspirations.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Primary Areas of Interest
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {interestOptions.map((option) => {
                        const isSelected = formData.interests.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleInterest(option.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-blue-900 border-blue-900 text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {typeof option.icon === "string" ? (
                              <span>{option.icon}</span>
                            ) : (
                              <option.icon className="h-4 w-4" />
                            )}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Career Goals & Aspirations
                    </label>
                    <textarea
                      rows={4}
                      value={formData.careerGoals}
                      onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
                      placeholder="Describe where you see yourself in 3 years..."
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      This helps our AI match you with mentors from relevant industries.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <Button variant="ghost" onClick={handleBack} className="text-slate-600 hover:text-slate-900">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Profile
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Complete Setup
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Footer Security */}
        <div className="flex flex-col items-center mt-12 space-y-6">
          <div className="flex items-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-400" />
              <span>ENCRYPTED DATA</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" />
              <span>PRIVACY GUARANTEED</span>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Need assistance with your registration? Contact our{" "}
            <Link href="/support" className="text-blue-600 hover:underline">
              Academic Support Team
            </Link>{" "}
            or visit the{" "}
            <Link href="/help" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
