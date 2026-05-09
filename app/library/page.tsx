"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { 
  LayoutDashboard, Library, Users, Brain, Flag, GraduationCap, Settings, HelpCircle, 
  Plus, Search, Filter, Calendar, Star, ArrowRight, Lightbulb,
  User, ChevronDown
} from "lucide-react";
import { useState } from "react";

const projects = [
  {
    id: 1,
    title: "SecureLink: Quantum-Resistant P2P Mesh Network",
    description: "A decentralized communication platform leveraging post-quantum cryptography to ensure long-term privacy in...",
    uniqueness: 9.4,
    domain: "AI & Cybersecurity",
    tech: ["Rust", "Libp2p", "WebAssembly"],
    image: "dark",
    released: "June 2024",
    honors: "Academic Honors",
  },
  {
    id: 2,
    title: "MicroWealth: Fractional Real Estate for Gen Z",
    description: "Blockchain-backed ownership model for commercial properties with...",
    uniqueness: 8.8,
    domain: "Fintech",
    tech: ["Solidity", "React Native"],
    image: "light",
  },
  {
    id: 3,
    title: "YieldSense: LoRaWAN Soil Monitoring",
    description: "Low-power wide-area network sensors for remote farm monitoring...",
    uniqueness: 7.2,
    domain: "Agritech",
    tech: ["Python", "LoRa", "AWS IoT"],
    image: "light",
  },
  {
    id: 4,
    title: "MindFlow: EEG-Based Focus Tracker",
    description: "Using wearable EEG sensors to provide real-time audio feedback fo...",
    uniqueness: 8.1,
    domain: "Edtech",
    tech: ["TensorFlow", "Swift"],
    image: "light",
  },
];

export default function GPLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");
  const [selectedYear, setSelectedYear] = useState("Release Year");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Left Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-xs font-bold text-white">GP</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">GPspark</div>
              <div className="text-xs text-slate-500">Graduation Project</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/brainstorm" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">Brainstorm AI</span>
          </Link>
          <Link href="/milestones" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Flag className="h-5 w-5" />
            <span className="text-sm font-medium">Milestones</span>
          </Link>
          <Link href="/mentors" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Mentors</span>
          </Link>
          <Link href="/library" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-900">
            <Library className="h-5 w-5" />
            <span className="text-sm font-semibold">GP Library</span>
          </Link>
          <Link href="/team" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Team Search</span>
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
        <Navbar 
          title="GP Library" 
          description="Explore historical graduation projects and analyze market gaps"
          tag={{ label: "200+ Projects", color: "blue" }}
        />

        {/* Library Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "all" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "favorites" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Favorites
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search keywords, stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none flex-1"
              />
            </div>
            <div className="relative">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none cursor-pointer"
              >
                <option>All Domains</option>
                <option>AI & Cybersecurity</option>
                <option>Fintech</option>
                <option>Agritech</option>
                <option>Edtech</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none cursor-pointer"
              >
                <option>Release Year</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <Button variant="outline" className="border-slate-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Featured Project */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-64 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8 relative">
                <div className="text-center text-white">
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Project Visual</div>
                  <div className="text-lg font-bold">SAFE CWORK</div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                    AI & Cybersecurity
                  </span>
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    SecureLink: Quantum-Resistant P2P Mesh Network
                  </h3>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">9.4<span className="text-lg text-slate-400">/10</span></div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Uniqueness Factor</div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  A decentralized communication platform leveraging post-quantum cryptography to ensure long-term privacy in...
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Rust", "Libp2p", "WebAssembly"].map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-sm text-slate-500">
                    Released June 2024 • <span className="text-slate-700 font-medium">Academic Honors</span>
                  </div>
                  <Button variant="ghost" className="text-blue-900 hover:text-blue-800 hover:bg-blue-50">
                    View Case Study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Other Projects */}
            {projects.slice(1).map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    {project.domain}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{project.uniqueness}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Uniqueness</div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech) => (
                    <span key={tech} className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
                <Button variant="outline" className="w-full border-blue-200 text-blue-900 hover:bg-blue-50">
                  Analyze Architecture
                </Button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Can't find a project similar to yours?
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
              That's a good sign! It means your idea might have a very high Uniqueness Factor. 
              Use our AI Brainstorm tool to validate your proposition.
            </p>
            <Button className="bg-blue-900 hover:bg-blue-800 text-white">
              Start Uniqueness Audit
            </Button>
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
