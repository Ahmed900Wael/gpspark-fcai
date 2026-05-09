"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Library, Users, Brain, Settings, HelpCircle, 
  Plus, Search, Filter, Bell, User, MessageSquare, Lightbulb
} from "lucide-react";
import { useState } from "react";

const students = [
  {
    id: 1,
    name: "Amara Chen",
    role: "Full-stack developer interested in sustainable energy tech and IoT applications.",
    skills: ["React", "Node.js", "AWS"],
    status: "available",
    avatar: "blue",
  },
  {
    id: 2,
    name: "Marcus Thorne",
    role: "UI/UX specialist focused on accessibility and inclusive design for educational platforms.",
    skills: ["Figma", "Prototyping", "User Research"],
    status: "available",
    avatar: "indigo",
  },
  {
    id: 3,
    name: "Lila Vance",
    role: "Data Scientist with experience in predictive modeling and natural language processing.",
    skills: ["Python", "PyTorch", "Tableau"],
    status: "available",
    avatar: "green",
  },
];

const teams = [
  {
    id: 1,
    name: "EcoTrack AI",
    description: "Building a mobile app for carbon footprint tracking using computer vision.",
    needs: ["Mobile Dev", "ML Eng"],
    status: "urgent",
  },
  {
    id: 2,
    name: "SecureHealth",
    description: "Blockchain-based patient record management system for clinics.",
    needs: ["Backend", "QA"],
    status: "2slots",
  },
  {
    id: 3,
    name: "ArVR Classroom",
    description: "Immersive 3D environments for remote university lectures.",
    needs: [],
    status: "full",
  },
];

const tips = [
  "Keep your profile skills up to date to get matched with the right projects.",
  "Include a short bio about your graduation project goals.",
  'Be responsive to "Connect" requests – they expire in 48 hours.',
];

export default function TeamFormation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["AI/ML"]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Left Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
              JD
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">FCAI Student</div>
              <div className="text-xs text-slate-500">Senior Year</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/library" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Library className="h-5 w-5" />
            <span className="text-sm font-medium">GP Library</span>
          </Link>
          <Link href="/team" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-900">
            <Users className="h-5 w-5" />
            <span className="text-sm font-semibold">Team Search</span>
          </Link>
          <Link href="/brainstorm" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">Brainstorm AI</span>
          </Link>
        </nav>

        <div className="p-4 space-y-1 border-t border-slate-200">
          <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white mb-2">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <Link href="/support" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Support</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Homepage
            </Link>
            <Link href="/library" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Library
            </Link>
            <Link href="/team" className="text-sm font-semibold text-blue-900 border-b-2 border-blue-900 pb-1">
              Team Formation
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900" />
            <User className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900" />
            <Button className="bg-blue-900 hover:bg-blue-800 text-white">
              Sign In
            </Button>
          </div>
        </header>

        {/* Team Formation Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-3">Team Formation</h1>
              <p className="text-slate-600 max-w-2xl">
                Connect with fellow seniors to build your capstone project team. 
                Filter by technical skills, project interests, and availability.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-blue-200 text-blue-900 bg-blue-50 hover:bg-blue-100">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button className="bg-green-700 hover:bg-green-600 text-white">
                <Users className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white mb-8">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by skills (e.g. React, Python, UI Design)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1"
            />
            <div className="flex gap-2">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-medium"
                >
                  {skill}
                  <button onClick={() => toggleSkill(skill)} className="hover:text-blue-700">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Students Grid */}
            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-4">
                {students.map((student) => (
                  <div key={student.id} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-bold relative">
                        {student.name.split(" ").map(n => n[0]).join("")}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                      </div>
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide">
                        Available
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">
                      {student.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {student.role}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {student.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                ))}

                {/* Loading Placeholder */}
                <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center">
                  <Users className="h-8 w-8 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium mb-1">More Students loading...</p>
                  <p className="text-slate-400 text-xs">Keep scrolling to find more matches based on your skills.</p>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Teams Seeking Members */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Teams Seeking Members</h3>
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div key={team.id} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{team.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          team.status === "urgent" ? "bg-amber-400 text-amber-900" :
                          team.status === "2slots" ? "bg-green-500 text-white" :
                          "bg-slate-500 text-white"
                        }`}>
                          {team.status === "urgent" ? "URGENT" :
                           team.status === "2slots" ? "2 SLOTS" :
                           "FULL"}
                        </span>
                      </div>
                      <p className="text-sm text-blue-100 mb-3">{team.description}</p>
                      {team.needs.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-blue-200">Needs:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {team.needs.map((need) => (
                              <span key={need} className="px-2 py-0.5 rounded bg-white/20 text-xs">
                                {need}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <Button 
                        className={`w-full text-sm ${
                          team.status === "full" 
                            ? "bg-white/20 text-white/50 cursor-not-allowed" 
                            : "bg-white text-blue-900 hover:bg-blue-50"
                        }`}
                        disabled={team.status === "full"}
                      >
                        {team.status === "full" ? "Position Filled" : "Apply to Team"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Tips for Teams</h4>
                </div>
                <ul className="space-y-3">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-600 to-indigo-700">
                <span className="text-xs font-bold text-white">GP</span>
              </div>
            </div>
            <div className="flex gap-6 text-xs text-slate-500">
              <Link href="/about" className="hover:text-slate-900">About</Link>
              <Link href="/methodology" className="hover:text-slate-900">Methodology</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
              <Link href="/support" className="hover:text-slate-900">Contact Support</Link>
            </div>
            <span className="text-xs text-slate-500">© 2024 GPspark FCAI. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
