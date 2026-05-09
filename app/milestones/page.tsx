"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SimpleHeader } from "@/components/navbar";
import { 
  LayoutDashboard, Brain, Flag, GraduationCap, Library, Users, Settings, HelpCircle, 
  Plus, Share2, CheckCircle2, Circle, Clock, MessageSquare, 
  FileText, ChevronRight, Download
} from "lucide-react";

const phases = [
  { number: 1, name: "Proposal", status: "completed", label: "COMPLETED" },
  { number: 2, name: "Lit. Review", status: "completed", label: "COMPLETED" },
  { number: 3, name: "Development", status: "current", label: "CURRENT PHASE" },
  { number: 4, name: "Market Analysis", status: "pending", label: "PENDING" },
  { number: 5, name: "Final Prep", status: "pending", label: "PENDING" },
];

const tasks = [
  {
    id: 1,
    title: "Finalize swarm coordination algorithm",
    status: "completed",
    date: "Completed on Nov 02",
    taskNumber: "Task 1",
  },
  {
    id: 2,
    title: "UI/UX dashboard for drone monitoring",
    status: "current",
    date: "Due in 3 days",
    assets: 2,
    taskNumber: "Current",
  },
  {
    id: 3,
    title: "Hardware sensor integration & testing",
    status: "pending",
    date: "Start date: Nov 15",
    taskNumber: "Task 3",
  },
];

const nextPhaseTasks = [
  "Vendor partnership vetting",
  "Pricing model simulation",
];

export default function Milestones() {
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

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/brainstorm" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">Brainstorm AI</span>
          </Link>
          <Link href="/milestones" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-900">
            <Flag className="h-5 w-5" />
            <span className="text-sm font-semibold">Milestones</span>
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
        <SimpleHeader 
          links={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Milestones", href: "/milestones", active: true },
            { label: "Brainstorm AI", href: "/brainstorm" },
          ]}
        />

        {/* Milestones Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-28">
          {/* Section Heading with Tag */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">
                Phase 3
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Autonomous Swarm Logistics</h1>
            <p className="text-slate-600 mt-1">Optimization of decentralized routing protocols for urban drone fleets.</p>
          </div>

          {/* Breadcrumb & Actions */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span>PROJECTS</span>
              <ChevronRight className="h-4 w-4" />
              <span>AUTONOMOUS SWARM LOGISTICS</span>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" className="border-slate-200">
                <Share2 className="h-4 w-4 mr-2" />
                Project Brief
              </Button>
            </div>
          </div>

          {/* Roadmap Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Roadmap Overview</h3>
            <div className="flex items-center justify-between">
              {phases.map((phase, index) => (
                <div key={phase.number} className="flex flex-col items-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    phase.status === "completed"
                      ? "bg-green-600 text-white"
                      : phase.status === "current"
                      ? "bg-blue-900 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {phase.status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : phase.status === "current" ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    ) : phase.number === 4 ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-900">{phase.name}</div>
                    <div className={`text-xs uppercase tracking-wide ${
                      phase.status === "completed" ? "text-green-600" :
                      phase.status === "current" ? "text-blue-900" :
                      "text-slate-400"
                    }`}>
                      {phase.label}
                    </div>
                  </div>
                  {index < phases.length - 1 && (
                    <div className={`absolute top-6 left-12 w-full h-0.5 ${
                      phase.status === "completed" ? "bg-green-600" :
                      phase.status === "current" ? "bg-blue-900" :
                      "bg-slate-200"
                    }`} style={{ width: "calc(100% + 2rem)" }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Current Phase */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-900 flex items-center justify-center text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Phase 3: Prototype Development
                    </h3>
                    <p className="text-sm text-slate-500">Scheduled: Oct 15 - Dec 20, 2023</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">68%</div>
                  <div className="text-xs text-slate-500 uppercase">Progress</div>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 mb-6">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      task.status === "completed"
                        ? "bg-slate-50 border-slate-200"
                        : task.status === "current"
                        ? "bg-white border-blue-200"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : task.status === "current" ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-900 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400" />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${
                          task.status === "pending" ? "text-slate-500" : "text-slate-900"
                        }`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {task.status === "current" && (
                            <span className="text-xs text-red-600 font-medium">{task.date}</span>
                          )}
                          {task.status === "completed" && (
                            <span className="text-xs text-slate-500">{task.date}</span>
                          )}
                          {task.status === "pending" && (
                            <span className="text-xs text-slate-500">{task.date}</span>
                          )}
                          {task.assets && (
                            <span className="text-xs text-slate-500"> {task.assets} assets</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{task.taskNumber}</span>
                  </div>
                ))}
              </div>

              {/* Team & Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex -space-x-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-medium">
                    +1
                  </div>
                </div>
                <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                  Submit Milestone
                </Button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Next Phase */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Next Phase</h4>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Phase 4</div>
                  <h5 className="font-semibold text-slate-900 mb-2">Market Analysis</h5>
                  <p className="text-sm text-slate-600 mb-3">
                    Feasibility study and competitive landscape for autonomous drone delivery.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">Research</span>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">Strategy</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {nextPhaseTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                      <Circle className="h-4 w-4 text-slate-400" />
                      {task}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor Feedback */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5" />
                  <h4 className="font-semibold">Mentor Feedback</h4>
                </div>
                <p className="text-sm text-blue-100 mb-4 italic">
                  "The current routing logic is impressive. Focus on edge-case latencies for the next sprint review."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-bold">JV</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Dr. Julian Vane</div>
                    <div className="text-xs text-blue-200">System Architect</div>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Need Help?</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Stuck on a specific task? Connect with a mentor or peer.
                </p>
                <Button variant="outline" className="border-blue-200 text-blue-900 hover:bg-blue-50">
                  Start a Discussion
                </Button>
              </div>
            </div>
          </div>

          {/* Review Archive */}
          <div className="mt-8 bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Review Archive</h3>
            <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
              All previous milestone submissions and feedback logs are archived and available for your final presentation assembly.
            </p>
            <Button variant="ghost" className="text-blue-900 hover:text-blue-800 hover:bg-blue-50">
              Access Project Archive
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="GPSpark Logo" className="w-6 h-6" />
            </div>
            <div className="flex gap-6 text-xs text-slate-500">
              <Link href="/about" className="hover:text-slate-900">About</Link>
              <Link href="/methodology" className="hover:text-slate-900">Methodology</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
              <Link href="/support" className="hover:text-slate-900">Contact Support</Link>
            </div>
            <span className="text-xs text-slate-500">© 2024 GPSpark FCAI. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
