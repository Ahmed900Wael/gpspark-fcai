"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Brain, Globe, Shield, Lock, HelpCircle } from "lucide-react";

const steps = [
  { number: 1, title: "Create Account", status: "current" },
  { number: 2, title: "Complete Profile", status: "pending" },
  { number: 3, title: "Start Building", status: "pending" },
];

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-8">
        <div className="flex h-16 w-16 items-center justify-center mb-6">
          <img src="/logo.png" alt="GPSpark Logo" className="w-16 h-16" />
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
                {steps.map((step, index) => (
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
                      {index < steps.length - 1 && (
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

          {/* Main Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Get Started with GPSpark
              </h2>
              <p className="text-slate-600">
                Create your account to access all features and start building your graduation project.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Create Your Account</h4>
                  <p className="text-sm text-slate-600 mt-1">Sign up with your university email to get started.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Complete Your Profile</h4>
                  <p className="text-sm text-slate-600 mt-1">Add your academic info, interests, and career goals.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Start Building</h4>
                  <p className="text-sm text-slate-600 mt-1">Use AI brainstorming, find teammates, and track milestones.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
              <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                ← Back to Home
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-5 text-base">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/signin" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
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
