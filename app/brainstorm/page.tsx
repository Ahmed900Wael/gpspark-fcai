"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SimpleHeader } from "@/components/navbar";
import { 
  LayoutDashboard, Brain, Flag, GraduationCap, Library, Users, Settings, Plus, Send, Paperclip, 
  Clock, MoreVertical, User, HelpCircle, CheckCircle2, 
  AlertTriangle, Battery, BarChart3, FileText, ChevronRight 
} from "lucide-react";
import { useState } from "react";

const messages = [
  {
    id: 1,
    role: "assistant",
    content: `Hello! I'm your AI tutor. I've analyzed your initial proposal for the **Smart Agriculture** project. It's a robust direction. To help narrow our scope, are you leaning more towards large-scale industrial optimization or small-scale urban farming accessibility?`,
    time: "10:42 AM",
  },
  {
    id: 2,
    role: "user",
    content: `I'm interested in small-scale accessibility. I want to build a system that local urban farmers can afford, likely using low-power wide-area networks (LPWAN) to cover community garden plots without high infrastructure costs.`,
    time: "10:45 AM",
  },
  {
    id: 3,
    role: "assistant",
    content: `That is a high-impact niche. By focusing on **LoRaWAN**, we can address the primary barrier for urban community gardens: cost and existing Wi-Fi range limitations. Here's how we might structure the research:

• Cost-benefit analysis of ESP32 vs. dedicated LoRa chips.
• Data mesh protocols for high-density urban environments.`,
    time: "10:47 AM",
  },
];

const marketGaps = [
  {
    title: "Low-cost LoRaWAN sensors",
    description: "Current solutions target enterprise agriculture; local community garden tier is unserved.",
    icon: "🌐",
  },
  {
    title: "Simplified Data viz",
    description: "Existing dashboards are too technical for casual urban farmers.",
    icon: "",
  },
];

const technicalChallenges = [
  {
    title: "Signal Attenuation",
    description: "Urban concrete density may interfere with LoRa signals. Test sites required.",
    severity: "high",
    icon: AlertTriangle,
  },
  {
    title: "Battery Longevity",
    description: "Remote nodes must last 1+ years without maintenance in varied weather.",
    severity: "medium",
    icon: Battery,
  },
];

export default function BrainstormAI() {
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Left Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="GPSpark Logo" className="w-10 h-10" />
            <div>
              <div className="text-sm font-semibold text-slate-900">GPSpark</div>
              <div className="text-xs text-slate-500">Graduation Project</div>
            </div>
          </div>
        </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">GPSpark</div>
              <div className="text-xs text-slate-500">Graduation Project</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/brainstorm" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-900">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-semibold">Brainstorm AI</span>
          </Link>
          <Link href="/milestones" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Flag className="h-5 w-5" />
            <span className="text-sm font-medium">Milestones</span>
          </Link>
          <Link href="/mentors" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Mentors</span>
          </Link>
          <Link href="/library" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Library className="h-5 w-5" />
            <span className="text-sm font-medium">GP Library</span>
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
        <SimpleHeader />

        {/* Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                      Active
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">Brainstorming Session</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-600">Project Focus: Smart Agriculture Systems</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                    <Clock className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.role === "assistant" 
                      ? "bg-blue-900 text-white" 
                      : "bg-gradient-to-br from-blue-400 to-indigo-500 text-white"
                  }`}>
                    {msg.role === "assistant" ? (
                      <Brain className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className={`max-w-[70%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`rounded-2xl px-5 py-4 ${
                      msg.role === "user"
                        ? "bg-blue-900 text-white"
                        : "bg-white border border-slate-200 text-slate-700"
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {msg.content.split("\n").map((line, i) => (
                          <p key={i} className={line.startsWith("•") ? "ml-4" : ""}>
                            {line.replace("•", "○").replace("**", "").split("**").map((part, j) => 
                              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <span className={`text-xs font-medium ${msg.role === "assistant" ? "text-slate-500" : "text-slate-400"}`}>
                        {msg.role === "assistant" ? "GPSpark AI" : "You"}
                      </span>
                      <span className="text-xs text-slate-400">• {msg.time}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Suggestion Chips */}
              <div className="flex gap-3 ml-14">
                <button className="px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-900 text-sm font-medium hover:bg-blue-100 transition-colors">
                  Compare LoRaWAN Gateways
                </button>
                <button className="px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-900 text-sm font-medium hover:bg-blue-100 transition-colors">
                  Energy Harvesting Ideas
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your ideas here..."
                  className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none"
                />
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center mt-3">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  Powered by GPSpark Scholastic Engine v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-80 bg-slate-50 border-l border-slate-200 p-6 overflow-y-auto">
            {/* Project Feasibility */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Project Feasibility</h3>
                <BarChart3 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#16a34a" 
                      strokeWidth="8" 
                      strokeDasharray={`${82 * 2.83} ${283 - 82 * 2.83}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">82%</span>
                    <span className="text-xs text-slate-500 uppercase">High Potential</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 text-center">
                Your project scores high on <span className="font-semibold text-slate-900">Novelty</span> and <span className="font-semibold text-slate-900">Social Impact</span>.
              </p>
            </div>

            {/* Market Gaps */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Market Gaps Identified
              </h4>
              <div className="space-y-3">
                {marketGaps.map((gap, index) => (
                  <div key={index} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-lg">
                        {gap.icon}
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-900">{gap.title}</h5>
                        <p className="text-xs text-slate-600 mt-1">{gap.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Challenges */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Technical Challenges
              </h4>
              <div className="space-y-3">
                {technicalChallenges.map((challenge, index) => (
                  <div 
                    key={index} 
                    className={`bg-white rounded-xl border-l-4 p-4 ${
                      challenge.severity === "high" ? "border-l-red-500" : "border-l-amber-500"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <challenge.icon className={`h-4 w-4 ${
                          challenge.severity === "high" ? "text-red-600" : "text-amber-600"
                        }`} />
                        <h5 className={`text-sm font-semibold ${
                          challenge.severity === "high" ? "text-red-700" : "text-amber-700"
                        }`}>
                          {challenge.title}
                        </h5>
                      </div>
                      {challenge.severity === "high" && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{challenge.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <Button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200">
              <FileText className="h-4 w-4 mr-2" />
              Export Research Summary
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
