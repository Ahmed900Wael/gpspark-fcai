"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { 
  Search, Star, Calendar, MessageSquare, 
  CheckCircle2, Clock, Filter, ChevronDown, Mail
} from "lucide-react";
import { useState } from "react";

const mentors = [
  {
    id: 1,
    name: "Dr. Julian Vane",
    title: "System Architect",
    company: "TechCorp Industries",
    expertise: ["Distributed Systems", "Cloud Architecture", "DevOps"],
    rating: 4.9,
    reviews: 47,
    availability: "available",
    avatar: "JV",
    bio: "15+ years experience in large-scale distributed systems. Former lead architect at AWS.",
  },
  {
    id: 2,
    name: "Prof. Sarah Chen",
    title: "AI Research Lead",
    company: "MIT CSAIL",
    expertise: ["Machine Learning", "Computer Vision", "NLP"],
    rating: 4.8,
    reviews: 62,
    availability: "limited",
    avatar: "SC",
    bio: "Published 50+ papers in top AI conferences. Specializes in practical ML applications.",
  },
  {
    id: 3,
    name: "Eng. Marcus Rivera",
    title: "Senior Full-Stack Developer",
    company: "Google",
    expertise: ["React", "Node.js", "System Design"],
    rating: 4.7,
    reviews: 38,
    availability: "available",
    avatar: "MR",
    bio: "Built products used by millions. Passionate about mentoring the next generation of developers.",
  },
  {
    id: 4,
    name: "Dr. Amira Hassan",
    title: "Cybersecurity Expert",
    company: "Cisco Security",
    expertise: ["Network Security", "Cryptography", "Ethical Hacking"],
    rating: 4.9,
    reviews: 54,
    availability: "unavailable",
    avatar: "AH",
    bio: "Former NSA analyst turned educator. Helps students build secure systems from the ground up.",
  },
];

const feedbackRequests = [
  {
    id: 1,
    mentor: "Dr. Julian Vane",
    project: "Autonomous Swarm Logistics",
    status: "completed",
    date: "2 days ago",
    rating: 5,
  },
  {
    id: 2,
    mentor: "Prof. Sarah Chen",
    project: "Smart Agriculture AI",
    status: "pending",
    date: "5 hours ago",
    rating: null,
  },
];

const expertiseOptions = [
  "All Expertise",
  "AI & Machine Learning",
  "Web Development",
  "Cybersecurity",
  "Cloud & DevOps",
  "Mobile Development",
  "Data Science",
];

export default function Mentors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All Expertise");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Responsive */}
      <Sidebar activePage="/mentors" />

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <SimpleHeader />

        {/* Mentors Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Section Heading with Tag */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                24 Available
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Find Your Mentor</h1>
            <p className="text-slate-600 mt-1 max-w-2xl">
              Connect with industry experts and academic professionals who can guide your graduation project 
              from concept to completion.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-slate-500">Available Mentors</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">24</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="text-sm text-slate-500">Feedback Sessions</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">156</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-slate-500">Avg. Rating</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">4.8/5</div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white flex-1">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search mentors by name or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none flex-1"
              />
            </div>
            <div className="relative">
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none cursor-pointer"
              >
                {expertiseOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <Button variant="outline" className="border-slate-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Mentor Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {mentor.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{mentor.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        mentor.availability === "available" ? "bg-green-100 text-green-700" :
                        mentor.availability === "limited" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {mentor.availability === "available" ? "Available" :
                         mentor.availability === "limited" ? "Limited" :
                         "Unavailable"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{mentor.title}</p>
                    <p className="text-xs text-slate-500">{mentor.company}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4">{mentor.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.map((skill) => (
                    <span key={skill} className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-slate-900">{mentor.rating}</span>
                    <span className="text-sm text-slate-500">({mentor.reviews} reviews)</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="border-slate-200 text-slate-600 hover:bg-slate-50"
                      disabled={mentor.availability === "unavailable"}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button 
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                      disabled={mentor.availability === "unavailable"}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Book Session
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback Requests */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Feedback Requests</h3>
            <div className="space-y-3">
              {feedbackRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      request.status === "completed" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      {request.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{request.project}</div>
                      <div className="text-xs text-slate-500">Mentor: {request.mentor} • {request.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {request.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium text-slate-900">{request.rating}/5</span>
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {request.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
