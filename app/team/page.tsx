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
  Search, Users, MessageSquare, Lightbulb, Loader2, Plus, X,
  User, Check, X as XIcon, Trash2, LogOut, ChevronDown, Eye,
  Mail, ExternalLink, Link as LinkIcon, GitFork
} from "lucide-react";
import { useState, useEffect } from "react";

interface StudentProfile {
  id: string;
  full_name: string | null;
  university_email: string;
  interests: string[];
  career_goals: string;
  avatar_url: string | null;
  department: string;
  linkedin_url: string | null;
  github_url: string | null;
  gpa: string;
  academic_year: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  project_domain: string | null;
  max_members: number;
  status: string;
  created_by: string;
  created_at: string;
  member_count: number;
  is_owner: boolean;
  is_member: boolean;
  has_pending_request: boolean;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: StudentProfile | null;
}

interface TeamRequest {
  id: string;
  team_id: string;
  from_user_id: string;
  status: string;
  message: string;
  created_at: string;
  from_profile: StudentProfile | null;
}

const DOMAINS = [
  "AI & ML", "Web Development", "Mobile Development", "IoT",
  "Cybersecurity", "Blockchain", "Cloud & DevOps", "Data Science",
  "AR/VR", "EdTech", "HealthTech", "FinTech", "Sustainability",
  "Robotics", "Game Development", "Other",
];

export default function TeamFormation() {
  const { supabase, user } = useAuth();
  const { addNotification, createNotification, refreshNotifications } = useNotification();
  const [activeTab, setActiveTab] = useState<"discover" | "my-teams" | "requests">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [myTeamMembers, setMyTeamMembers] = useState<Record<string, TeamMember[]>>({});
  const [pendingRequests, setPendingRequests] = useState<TeamRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newTeamDomain, setNewTeamDomain] = useState("");
  const [newTeamMaxMembers, setNewTeamMaxMembers] = useState(4);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [studentTeamStatus, setStudentTeamStatus] = useState<Record<string, "RECRUITING" | "IN-TEAM" | "NOT-IN-TEAM">>({});
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await loadStudents();
      await loadStudentTeamStatus();
      await loadTeams();
      await loadMyTeams();
      await loadPendingRequests();
    } catch (error) {
      console.error("[TEAM] Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, university_email, interests, career_goals, avatar_url, department, linkedin_url, github_url, gpa, academic_year")
      .neq("id", user.id);

    if (error) throw error;
    setStudents(data || []);
  };

  const loadStudentTeamStatus = async () => {
    if (!supabase || !user) return;
    const { data: memberships } = await supabase
      .from("team_members")
      .select("user_id, team_id");

    if (!memberships) {
      setStudentTeamStatus({});
      return;
    }

    const { data: teams } = await supabase
      .from("teams")
      .select("id, created_by, status");

    const statusMap: Record<string, "RECRUITING" | "IN-TEAM" | "NOT-IN-TEAM"> = {};

    const teamOwnerIds = new Set(teams?.filter(t => t.status === "recruiting").map(t => t.created_by) || []);
    const memberIds = new Set(memberships.map(m => m.user_id));

    for (const member of memberships) {
      const team = teams?.find(t => t.id === member.team_id);
      if (team && team.status === "recruiting" && team.created_by === member.user_id) {
        statusMap[member.user_id] = "RECRUITING";
      } else if (!statusMap[member.user_id]) {
        statusMap[member.user_id] = "IN-TEAM";
      }
    }

    for (const ownerId of teamOwnerIds) {
      if (!statusMap[ownerId]) {
        statusMap[ownerId] = "RECRUITING";
      }
    }

    setStudentTeamStatus(statusMap);
  };

  const loadTeams = async () => {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: members } = await supabase
      .from("team_members")
      .select("team_id, user_id");

    const { data: requests } = await supabase
      .from("team_requests")
      .select("team_id, from_user_id, status")
      .eq("from_user_id", user.id);

    const memberCounts: Record<string, number> = {};
    members?.forEach(m => {
      memberCounts[m.team_id] = (memberCounts[m.team_id] || 0) + 1;
    });

    const myMemberTeams = new Set(members?.filter(m => m.user_id === user.id).map(m => m.team_id) || []);
    const myPendingTeams = new Set(requests?.filter(r => r.status === "pending").map(r => r.team_id) || []);

    const enriched = (data || []).map(team => ({
      ...team,
      member_count: memberCounts[team.id] || 0,
      is_owner: team.created_by === user.id,
      is_member: myMemberTeams.has(team.id),
      has_pending_request: myPendingTeams.has(team.id),
    }));

    setTeams(enriched);
  };

  const loadMyTeams = async () => {
    if (!supabase || !user) return;
    const { data: memberships, error: memError } = await supabase
      .from("team_members")
      .select("team_id, user_id, role, joined_at, id")
      .eq("user_id", user.id);

    if (memError) throw memError;
    if (!memberships || memberships.length === 0) {
      setMyTeams([]);
      setMyTeamMembers({});
      return;
    }

    const teamIds = memberships.map(m => m.team_id);
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .in("id", teamIds);

    if (teamError) throw teamError;

    const { data: allMembers } = await supabase
      .from("team_members")
      .select("team_id, user_id, role, joined_at, id")
      .in("team_id", teamIds);

    const memberCounts: Record<string, number> = {};
    allMembers?.forEach(m => {
      memberCounts[m.team_id] = (memberCounts[m.team_id] || 0) + 1;
    });

    const membersByTeam: Record<string, TeamMember[]> = {};
    for (const teamId of teamIds) {
      const teamMemberRows = allMembers?.filter(m => m.team_id === teamId) || [];
      const profileIds = teamMemberRows.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, university_email, interests, career_goals, avatar_url, department, linkedin_url, github_url, gpa, academic_year")
        .in("id", profileIds);

      membersByTeam[teamId] = teamMemberRows.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id) || null,
      }));
    }

    setMyTeamMembers(membersByTeam);

    const enriched = (teamData || []).map(team => ({
      ...team,
      member_count: memberCounts[team.id] || 0,
      is_owner: team.created_by === user.id,
      is_member: true,
      has_pending_request: false,
    }));

    setMyTeams(enriched);
  };

  const loadPendingRequests = async () => {
    if (!supabase || !user) return;
    const { data: myTeamsData } = await supabase
      .from("teams")
      .select("id")
      .eq("created_by", user.id);

    if (!myTeamsData || myTeamsData.length === 0) {
      setPendingRequests([]);
      return;
    }

    const myTeamIds = myTeamsData.map(t => t.id);
    const { data: requests, error } = await supabase
      .from("team_requests")
      .select("id, team_id, from_user_id, status, message, created_at")
      .in("team_id", myTeamIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const requesterIds = requests?.map(r => r.from_user_id) || [];
    const { data: profiles } = requesterIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, university_email, interests, career_goals, avatar_url, department, linkedin_url, github_url, gpa, academic_year")
          .in("id", requesterIds)
      : { data: [] };

    const enriched = (requests || []).map(r => ({
      ...r,
      from_profile: profiles?.find(p => p.id === r.from_user_id) || null,
    }));

    setPendingRequests(enriched);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const createTeam = async () => {
    if (!newTeamName.trim() || !newTeamDesc.trim() || !supabase || !user) return;
    setCreatingTeam(true);
    try {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: newTeamName.trim(),
          description: newTeamDesc.trim(),
          project_domain: newTeamDomain || null,
          max_members: newTeamMaxMembers,
          created_by: user.id,
          status: "recruiting",
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
      setNewTeamDomain("");
      setNewTeamMaxMembers(4);
      setShowCreateTeam(false);
      await refreshNotifications();
      await loadData();
    } catch (error) {
      console.error("[TEAM] Error creating team:", error);
      addNotification("error", "Failed", "Could not create team.");
    } finally {
      setCreatingTeam(false);
    }
  };

  const applyToTeam = async (teamId: string) => {
    if (!supabase || !user) return;
    try {
      const { data: team } = await supabase
        .from("teams")
        .select("name, created_by")
        .eq("id", teamId)
        .single();

      const { error } = await supabase
        .from("team_requests")
        .insert({
          team_id: teamId,
          from_user_id: user.id,
          message: "I'd like to join your team!",
        });

      if (error) throw error;

      if (team) {
        const notifOk = await createNotification(team.created_by, "team_request", "New Join Request", `${user.fullName} wants to join "${team.name}".`, teamId);
        console.log("[TEAM] Request notification created:", notifOk);
      }

      addNotification("success", "Request Sent", "Team owner will review your application.");
      await refreshNotifications();
      await loadData();
    } catch (error) {
      console.error("[TEAM] Error applying to team:", error);
      addNotification("error", "Failed", "Could not send request.");
    }
  };

  const handleRequest = async (requestId: string, accept: boolean) => {
    if (!supabase) return;
    try {
      const { data: request } = await supabase
        .from("team_requests")
        .select("team_id, from_user_id")
        .eq("id", requestId)
        .single();

      if (!request) {
        addNotification("error", "Error", "Request not found.");
        return;
      }

      const { data: team } = await supabase
        .from("teams")
        .select("name, max_members")
        .eq("id", request.team_id)
        .single();

      if (accept) {
        const { data: members } = await supabase
          .from("team_members")
          .select("id")
          .eq("team_id", request.team_id);

        if (members && members.length >= (team?.max_members || 4)) {
          addNotification("error", "Team Full", "This team has reached its maximum capacity.");
          return;
        }

        const { error: insertError } = await supabase
          .from("team_members")
          .insert({
            team_id: request.team_id,
            user_id: request.from_user_id,
            role: "member",
          });

        if (insertError) {
          console.error("[TEAM] Error adding member:", insertError);
          addNotification("error", "Failed", "Could not add member to team.");
          return;
        }

        const notifOk = await createNotification(
          request.from_user_id,
          "team_accepted",
          "Welcome to the Team!",
          `You've been accepted to "${team?.name}".`,
          request.team_id
        );
        console.log("[TEAM] Accept notification created:", notifOk);
      } else {
        const notifOk = await createNotification(
          request.from_user_id,
          "team_rejected",
          "Request Declined",
          `Your request to join "${team?.name}" was not accepted.`,
          request.team_id
        );
        console.log("[TEAM] Reject notification created:", notifOk);
      }

      const { error: updateError } = await supabase
        .from("team_requests")
        .update({ status: accept ? "accepted" : "rejected" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      addNotification("success", "Request Updated", accept ? "Member added to team." : "Request rejected.");
      await refreshNotifications();
      await loadData();
    } catch (error) {
      console.error("[TEAM] Error handling request:", error);
      addNotification("error", "Failed", "Could not process request.");
    }
  };

  const leaveTeam = async (teamId: string) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", user.id);

      if (error) throw error;
      addNotification("success", "Left Team", "You have left the team.");
      await loadData();
    } catch (error) {
      console.error("[TEAM] Error leaving team:", error);
      addNotification("error", "Failed", "Could not leave team.");
    }
  };

  const revokeMember = async (teamId: string, memberId: string) => {
    if (!supabase || !user) return;
    try {
      const { data: member } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId)
        .eq("id", memberId)
        .single();

      if (!member) {
        addNotification("error", "Error", "Member not found.");
        return;
      }

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("id", memberId);

      if (error) throw error;

      const { data: team } = await supabase
        .from("teams")
        .select("name")
        .eq("id", teamId)
        .single();

      await createNotification(
        member.user_id,
        "team_rejected",
        "Removed from Team",
        `You have been removed from "${team?.name}".`,
        teamId
      );

      addNotification("success", "Member Removed", "Member has been removed from the team.");
      await refreshNotifications();
      await loadData();
    } catch (error) {
      console.error("[TEAM] Error revoking member:", error);
      addNotification("error", "Failed", "Could not remove member.");
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!supabase) return;
    try {
      const { data: members } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId);

      if (members && members.length > 0) {
        await supabase.from("team_members").delete().eq("team_id", teamId);
      }

      const { data: requests } = await supabase
        .from("team_requests")
        .select("id")
        .eq("team_id", teamId);

      if (requests && requests.length > 0) {
        await supabase.from("team_requests").delete().eq("team_id", teamId);
      }

      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;
      addNotification("success", "Team Deleted", "Team and all related data removed.");
      await loadData();
    } catch (error) {
      console.error("[TEAM] Error deleting team:", error);
      addNotification("error", "Failed", "Could not delete team.");
    }
  };

  const allInterests = Array.from(new Set(
    students.flatMap(s => s.interests || [])
  )).slice(0, 12);

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === "" || 
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.interests?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesInterests = selectedInterests.length === 0 ||
      selectedInterests.some(interest => student.interests?.includes(interest));
    
    return matchesSearch && matchesInterests;
  });

  const recruitingTeams = teams.filter(t => t.status === "recruiting" && !t.is_member && !t.has_pending_request);
  const pendingRequestCount = pendingRequests.length;

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
                {teams.length} Teams
              </span>
              {pendingRequestCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-amber-100 text-amber-700 border-amber-200">
                  {pendingRequestCount} Pending Request{pendingRequestCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Team Formation</h1>
            <p className="text-slate-600 mt-1 max-w-2xl">
              Connect with fellow seniors to build your capstone project team.
            </p>
          </div>

          <div className="inline-flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab("discover")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "discover" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Discover Students
            </button>
            <button
              onClick={() => setActiveTab("my-teams")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "my-teams" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Teams
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                activeTab === "requests" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Requests
              {pendingRequestCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                  {pendingRequestCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === "discover" && (
            <>
              <div className="flex justify-end mb-4">
                <Button 
                  className="bg-green-700 hover:bg-green-600 text-white"
                  onClick={() => setShowCreateTeam(!showCreateTeam)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </div>

              {showCreateTeam && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Create New Team</h3>
                    <button onClick={() => setShowCreateTeam(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                      <select
                        value={newTeamDomain}
                        onChange={(e) => setNewTeamDomain(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                      >
                        <option value="">Select domain...</option>
                        {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        value={newTeamDesc}
                        onChange={(e) => setNewTeamDesc(e.target.value)}
                        placeholder="What is your project about?"
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max Members</label>
                      <select
                        value={newTeamMaxMembers}
                        onChange={(e) => setNewTeamMaxMembers(Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-900"
                      >
                        {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex gap-3 w-full">
                        <Button variant="outline" className="flex-1" onClick={() => setShowCreateTeam(false)}>Cancel</Button>
                        <Button 
                          className="flex-1 bg-green-700 hover:bg-green-600 text-white"
                          onClick={createTeam}
                          disabled={creatingTeam || !newTeamName.trim() || !newTeamDesc.trim()}
                        >
                          {creatingTeam ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          Create
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white mb-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, department, or interests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm outline-none flex-1"
                />
                {selectedInterests.length > 0 && (
                  <div className="flex gap-2 flex-shrink-0 max-w-[200px] overflow-x-auto">
                    {selectedInterests.map(interest => (
                      <span key={interest} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-medium whitespace-nowrap">
                        {interest}
                        <button onClick={() => toggleInterest(interest)} className="hover:text-blue-700">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {allInterests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {allInterests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedInterests.includes(interest)
                          ? "bg-blue-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {interest}
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
                      {filteredStudents.map(student => {
                        const status = studentTeamStatus[student.id] || "NOT-IN-TEAM";
                        const statusConfig = {
                          "RECRUITING": { label: "RECRUITING", bg: "bg-amber-100 text-amber-700 border-amber-200" },
                          "IN-TEAM": { label: "IN-TEAM", bg: "bg-green-100 text-green-700 border-green-200" },
                          "NOT-IN-TEAM": { label: "NOT-IN-TEAM", bg: "bg-slate-100 text-slate-500 border-slate-200" },
                        };
                        const cfg = statusConfig[status];

                        return (
                        <div key={student.id} className="bg-white rounded-xl border border-slate-200 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {student.full_name ? student.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                              </div>
                              <div className="min-w-0">
                              <h3 className="text-base font-bold text-blue-900 truncate">{student.full_name || "Anonymous"}</h3>
                              <p className="text-xs text-slate-500">{student.department || "N/A"}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} whitespace-nowrap`}>
                              {cfg.label}
                            </span>
                          </div>
                          {student.interests && student.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {student.interests.slice(0, 4).map(i => (
                                <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{i}</span>
                              ))}
                              {student.interests.length > 4 && (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs">+{student.interests.length - 4}</span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{student.career_goals || "No career goals provided"}</p>
                          <Button 
                            className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                            onClick={() => { setSelectedStudent(student); setShowConnectModal(true); }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        </div>
                      );
                      })}
                      {filteredStudents.length === 0 && (
                        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center col-span-2">
                          <Users className="h-8 w-8 text-slate-300 mb-3" />
                          <p className="text-slate-500 font-medium mb-1">No students found</p>
                          <p className="text-slate-400 text-xs">Try adjusting your search or filters.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white">
                      <h3 className="text-lg font-bold mb-4">Teams Recruiting</h3>
                      {recruitingTeams.length > 0 ? (
                        <div className="space-y-3">
                          {recruitingTeams.slice(0, 5).map(team => (
                            <div key={team.id} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm">{team.name}</h4>
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500 text-white">
                                  {team.max_members - team.member_count} slots
                                </span>
                              </div>
                              {team.project_domain && (
                                <span className="text-xs text-blue-200">{team.project_domain}</span>
                              )}
                              <p className="text-xs text-blue-100 mt-1 line-clamp-2">{team.description}</p>
                              <Button 
                                className="w-full text-xs mt-3 bg-white text-blue-900 hover:bg-blue-50"
                                onClick={() => applyToTeam(team.id)}
                              >
                                Apply
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-blue-200 text-center py-4">No teams currently recruiting.</p>
                      )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-slate-900">Tips</h4>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                          Keep your profile interests up to date.
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                          Add a career goal to attract the right teammates.
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                          Respond to join requests within 48 hours.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "my-teams" && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
                </div>
              ) : myTeams.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Teams Yet</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                    Create a team or apply to an existing one to get started.
                  </p>
                  <Button className="bg-green-700 hover:bg-green-600 text-white" onClick={() => { setActiveTab("discover"); setShowCreateTeam(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Team
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTeams.map(team => {
                    const members = myTeamMembers[team.id] || [];
                    const isExpanded = expandedTeamId === team.id;
                    const slotsLeft = team.max_members - team.member_count;

                    return (
                      <div key={team.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-900">{team.name}</h3>
                                {team.is_owner && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Owner</span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  team.status === "recruiting" ? "bg-green-100 text-green-700" :
                                  team.status === "full" ? "bg-slate-100 text-slate-600" :
                                  "bg-blue-100 text-blue-700"
                                }`}>
                                  {team.status.toUpperCase()}
                                </span>
                              </div>
                              {team.project_domain && (
                                <span className="text-xs text-slate-500">{team.project_domain}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                                className="text-slate-500"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {isExpanded ? "Hide" : "Members"} ({team.member_count}/{team.max_members})
                              </Button>
                              {team.is_owner ? (
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete "${team.name}"? This cannot be undone.`)) {
                                      deleteTeam(team.id);
                                    }
                                  }}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (confirm(`Leave "${team.name}"?`)) {
                                      leaveTeam(team.id);
                                    }
                                  }}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <LogOut className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{team.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining</span>
                            <span>•</span>
                            <span>Created {new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50 p-4">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Team Members</h4>
                            {members.length > 0 ? (
                              <div className="grid sm:grid-cols-2 gap-3">
                                {members.map(member => (
                                  <div key={member.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {member.profile?.full_name ? member.profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-slate-900 truncate">{member.profile?.full_name || "Unknown"}</p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 capitalize">{member.role}</span>
                                        {member.role === "owner" && <span className="text-xs">👑</span>}
                                      </div>
                                    </div>
                                    {team.is_owner && member.role !== "owner" && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`Remove ${member.profile?.full_name || "this member"} from the team?`)) {
                                            revokeMember(team.id, member.id);
                                          }
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                                        title="Remove from team"
                                      >
                                        <XIcon className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 text-center py-4">No members yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "requests" && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Requests</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    When someone applies to join your team, their request will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {request.from_profile?.full_name ? request.from_profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{request.from_profile?.full_name || "Unknown User"}</h4>
                            {request.from_profile?.department && (
                              <p className="text-xs text-slate-500">{request.from_profile.department}</p>
                            )}
                            {request.from_profile?.interests && request.from_profile.interests.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {request.from_profile.interests.slice(0, 3).map(i => (
                                  <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{i}</span>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-slate-600 mt-2">{request.message}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-700 hover:bg-green-600 text-white"
                            onClick={() => handleRequest(request.id, true)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleRequest(request.id, false)}
                          >
                            <XIcon className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>

    {showConnectModal && selectedStudent && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConnectModal(false)} />
        <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                  {selectedStudent.full_name ? selectedStudent.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedStudent.full_name || "Anonymous"}</h3>
                  {(() => {
                    const status = studentTeamStatus[selectedStudent.id] || "NOT-IN-TEAM";
                    const statusConfig = {
                      "RECRUITING": { label: "RECRUITING", color: "text-amber-300" },
                      "IN-TEAM": { label: "IN-TEAM", color: "text-green-300" },
                      "NOT-IN-TEAM": { label: "NOT-IN-TEAM", color: "text-blue-200" },
                    };
                    return <p className={`text-xs font-semibold mt-1 ${statusConfig[status].color}`}>{statusConfig[status].label}</p>;
                  })()}
                </div>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {selectedStudent.interests && selectedStudent.interests.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.interests.map(i => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{i}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.career_goals && (
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Career Goals</label>
                <p className="text-sm text-slate-700">{selectedStudent.career_goals}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Academic Information</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500">Academic Year</span>
                  <span className="text-sm font-medium text-slate-900">{selectedStudent.academic_year || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500">Department</span>
                  <span className="text-sm font-medium text-slate-900">{selectedStudent.department || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500">GPA</span>
                  <span className="text-sm font-medium text-slate-900">{selectedStudent.gpa || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Contact Info</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{selectedStudent.university_email}</p>
                  </div>
                </div>

                {selectedStudent.linkedin_url ? (
                  <a
                    href={selectedStudent.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200">
                      <LinkIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">LinkedIn</p>
                      <p className="text-sm font-medium text-blue-600 truncate">View Profile</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 opacity-50">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">LinkedIn</p>
                      <p className="text-sm text-slate-400">Not provided</p>
                    </div>
                  </div>
                )}

                {selectedStudent.github_url ? (
                  <a
                    href={selectedStudent.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-300 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-300">
                      <GitFork className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">GitHub</p>
                      <p className="text-sm font-medium text-slate-700 truncate">View Profile</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 opacity-50">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <GitFork className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">GitHub</p>
                      <p className="text-sm text-slate-400">Not provided</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    </ProtectedRoute>
  );
}
