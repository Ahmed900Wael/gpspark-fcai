"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { useNotification } from "@/contexts/notification-context";
import { 
  Search, Filter, User, Users, MessageSquare, Lightbulb, Loader2, Plus
} from "lucide-react";
import { useState, useEffect } from "react";

interface Student {
  id: string;
  full_name: string | null;
  email: string;
  skills: string[];
  interests: string[];
  avatar_url: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string;
  project_domain: string | null;
  max_members: number;
  status: string;
  created_by: string;
  member_count?: number;
}

const DUMMY_STUDENTS: Student[] = [
  {
    id: "demo-1",
    full_name: "Amara Chen",
    email: "amara.chen@fcai.edu",
    skills: ["React", "Node.js", "AWS", "TypeScript"],
    interests: ["Sustainable Energy", "IoT", "Smart Cities"],
    avatar_url: null,
  },
  {
    id: "demo-2",
    full_name: "Marcus Thorne",
    email: "marcus.thorne@fcai.edu",
    skills: ["Figma", "Prototyping", "User Research", "Accessibility"],
    interests: ["EdTech", "Inclusive Design", "Healthcare"],
    avatar_url: null,
  },
  {
    id: "demo-3",
    full_name: "Lila Vance",
    email: "lila.vance@fcai.edu",
    skills: ["Python", "PyTorch", "Tableau", "SQL"],
    interests: ["AI/ML", "Data Science", "NLP"],
    avatar_url: null,
  },
  {
    id: "demo-4",
    full_name: "Omar Hassan",
    email: "omar.hassan@fcai.edu",
    skills: ["Flutter", "Firebase", "Dart", "REST APIs"],
    interests: ["Mobile Development", "FinTech", "Blockchain"],
    avatar_url: null,
  },
  {
    id: "demo-5",
    full_name: "Sofia Rodriguez",
    email: "sofia.rodriguez@fcai.edu",
    skills: ["Docker", "Kubernetes", "Go", "Terraform"],
    interests: ["DevOps", "Cloud Infrastructure", "Microservices"],
    avatar_url: null,
  },
  {
    id: "demo-6",
    full_name: "James Park",
    email: "james.park@fcai.edu",
    skills: ["Rust", "WebAssembly", "C++", "Systems Programming"],
    interests: ["Cybersecurity", "Performance Engineering", "Game Dev"],
    avatar_url: null,
  },
];

const DUMMY_TEAMS: Team[] = [
  {
    id: "demo-team-1",
    name: "EcoTrack AI",
    description: "Building a mobile app for carbon footprint tracking using computer vision and ML.",
    project_domain: "AI & Sustainability",
    max_members: 4,
    status: "recruiting",
    created_by: "demo-1",
    member_count: 2,
  },
  {
    id: "demo-team-2",
    name: "SecureHealth",
    description: "Blockchain-based patient record management system for clinics and hospitals.",
    project_domain: "Healthcare & Blockchain",
    max_members: 5,
    status: "recruiting",
    created_by: "demo-4",
    member_count: 3,
  },
  {
    id: "demo-team-3",
    name: "ArVR Classroom",
    description: "Immersive 3D environments for remote university lectures and lab simulations.",
    project_domain: "EdTech & AR/VR",
    max_members: 4,
    status: "recruiting",
    created_by: "demo-2",
    member_count: 1,
  },
  {
    id: "demo-team-4",
    name: "SmartGrid Optimizer",
    description: "AI-powered energy distribution optimization for smart city infrastructure.",
    project_domain: "IoT & Energy",
    max_members: 4,
    status: "recruiting",
    created_by: "demo-5",
    member_count: 2,
  },
];

export default function TeamFormation() {
  const { supabase, user } = useAuth();
  const { addNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  useEffect(() => {
    loadStudents();
    loadTeams();
  }, []);

  const loadStudents = async () => {
    if (!supabase) {
      setStudents(DUMMY_STUDENTS);
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, skills, interests, avatar_url")
        .neq("id", user?.id || "");

      if (error) throw error;
      setStudents(data && data.length > 0 ? data : DUMMY_STUDENTS);
    } catch (error) {
      console.error("[TEAM] Error loading students:", error);
      setStudents(DUMMY_STUDENTS);
    }
  };

  const loadTeams = async () => {
    if (!supabase) {
      setTeams(DUMMY_TEAMS);
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          member_count:team_members(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const teamsWithCount = data?.map(team => ({
        ...team,
        member_count: team.member_count?.[0]?.count || 0,
      })) || [];
      
      setTeams(teamsWithCount.length > 0 ? teamsWithCount : DUMMY_TEAMS);
    } catch (error) {
      console.error("[TEAM] Error loading teams:", error);
      setTeams(DUMMY_TEAMS);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const createTeam = async () => {
    if (!newTeamName.trim() || !newTeamDesc.trim()) return;
    
    if (!supabase || !user) {
      addNotification("success", "Demo Mode", `"${newTeamName}" would be created in production.`);
      setNewTeamName("");
      setNewTeamDesc("");
      setShowCreateTeam(false);
      return;
    }
    
    setCreatingTeam(true);
    try {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: newTeamName.trim(),
          description: newTeamDesc.trim(),
          created_by: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      addNotification("success", "Team Created", `"${newTeamName}" is now live!`);
      setNewTeamName("");
      setNewTeamDesc("");
      setShowCreateTeam(false);
      loadTeams();
    } catch (error) {
      console.error("[TEAM] Error creating team:", error);
      addNotification("error", "Failed", "Could not create team.");
    } finally {
      setCreatingTeam(false);
    }
  };

  const applyToTeam = async (teamId: string) => {
    if (teamId.startsWith("demo-")) {
      addNotification("success", "Request Sent", "Team owner will review your application.");
      return;
    }
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from("team_requests")
        .insert({
          team_id: teamId,
          from_user_id: user.id,
          message: "I'd like to join your team!",
        });

      if (error) throw error;
      addNotification("success", "Request Sent", "Team owner will review your application.");
    } catch (error) {
      console.error("[TEAM] Error applying to team:", error);
      addNotification("error", "Failed", "Could not send request.");
    }
  };

  const allSkills = Array.from(new Set(
    students.flatMap(s => s.skills || [])
  )).slice(0, 10);

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === "" || 
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSkills = selectedSkills.length === 0 ||
      selectedSkills.every(skill => student.skills?.includes(skill));
    
    return matchesSearch && matchesSkills;
  });

  const tips = [
    "Keep your profile skills up to date to get matched with the right projects.",
    "Include a short bio about your graduation project goals.",
    'Be responsive to "Connect" requests – they expire in 48 hours.',
  ];

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-slate-50">
      <Sidebar activePage="/team" />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <SimpleHeader />

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                {teams.length} Active Teams
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Team Formation</h1>
            <p className="text-slate-600 mt-1 max-w-2xl">
              Connect with fellow seniors to build your capstone project team. 
              Filter by technical skills, project interests, and availability.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mb-8">
            <Button variant="outline" className="border-blue-200 text-blue-900 bg-blue-50 hover:bg-blue-100">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              className="bg-green-700 hover:bg-green-600 text-white"
              onClick={() => setShowCreateTeam(!showCreateTeam)}
            >
              <Users className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          {showCreateTeam && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Team</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. EcoTrack AI"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                    placeholder="What is your project about?"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateTeam(false)}>Cancel</Button>
                  <Button 
                    className="bg-green-700 hover:bg-green-600 text-white"
                    onClick={createTeam}
                    disabled={creatingTeam || !newTeamName.trim() || !newTeamDesc.trim()}
                  >
                    {creatingTeam ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create
                  </Button>
                </div>
              </div>
            </div>
          )}

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

          {allSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {allSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? "bg-blue-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-bold relative">
                          {student.full_name ? student.full_name.split(" ").map(n => n[0]).join("") : "U"}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                        </div>
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide">
                          Available
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">
                        {student.full_name || "Anonymous Student"}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">
                        {student.interests?.join(", ") || "Looking for a project team"}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {student.skills?.map((skill) => (
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

                  {filteredStudents.length === 0 && (
                    <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center col-span-2">
                      <Users className="h-8 w-8 text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium mb-1">No students found</p>
                      <p className="text-slate-400 text-xs">Try adjusting your search or filters.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Teams Seeking Members</h3>
                  <div className="space-y-4">
                    {teams.filter(t => t.status === "recruiting").map((team) => (
                      <div key={team.id} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{team.name}</h4>
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500 text-white">
                            {team.max_members - (team.member_count || 0)} SLOTS
                          </span>
                        </div>
                        <p className="text-sm text-blue-100 mb-3">{team.description}</p>
                        <Button 
                          className="w-full text-sm bg-white text-blue-900 hover:bg-blue-50"
                          onClick={() => applyToTeam(team.id)}
                        >
                          Apply to Team
                        </Button>
                      </div>
                    ))}
                    {teams.filter(t => t.status === "recruiting").length === 0 && (
                      <p className="text-sm text-blue-200 text-center py-4">No teams currently recruiting.</p>
                    )}
                  </div>
                </div>

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
          )}
        </div>

        <Footer />
      </div>
    </div>
    </ProtectedRoute>
  );
}
