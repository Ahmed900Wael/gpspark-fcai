"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { SimpleHeader } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { useNotification } from "@/contexts/notification-context";
import { supabase } from "@/lib/supabase";
import { 
  Brain, Send, Paperclip, MoreVertical, User, 
  AlertTriangle, Battery, BarChart3, FileText, Loader2, Plus, MessageSquare, Trash2, Sparkles, Globe
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  time: string;
}

interface BrainstormSession {
  id: string;
  project_focus: string;
  created_at: string;
}

interface MarketGap {
  title: string;
  description: string;
}

interface TechnicalChallenge {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

const SUGGESTION_PHASES = {
  welcome: [
    "I have a project idea in mind",
    "Help me find a project idea",
    "What's trending in tech?",
    "Analyze my project feasibility",
  ],
  exploring: [
    "What tech stack should I use?",
    "How do I validate this idea?",
    "Who are the competitors?",
    "What are the technical challenges?",
  ],
  deepening: [
    "Suggest an architecture",
    "How should I structure the database?",
    "What APIs should I integrate?",
    "How do I make it scalable?",
  ],
  refining: [
    "How do I present this to my supervisor?",
    "What should my milestones be?",
    "How do I document this?",
    "What are the next steps?",
  ],
};

function getSuggestions(messageCount: number, lastMessageRole: string, userInterests: string[]): string[] {
  let phase: keyof typeof SUGGESTION_PHASES;
  
  if (messageCount <= 2) {
    phase = "exploring";
  } else if (messageCount <= 6) {
    phase = "deepening";
  } else {
    phase = "refining";
  }

  let suggestions = [...SUGGESTION_PHASES[phase]];

  if (userInterests.length > 0 && phase === "exploring") {
    suggestions = [
      `Project ideas in ${userInterests[0]}`,
      ...suggestions.slice(0, 3),
    ];
  }

  return suggestions.slice(0, 4);
}

export default function BrainstormAI() {
  const { user, supabaseUser } = useAuth();
  const { addNotification } = useNotification();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<BrainstormSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [feasibilityData, setFeasibilityData] = useState<{
    score: number;
    breakdown: {
      technicalDepth: number;
      marketAnalysis: number;
      implementationPlan: number;
      innovation: number;
      resourceFeasibility: number;
    };
    feedback: string;
  }>({
    score: 20,
    breakdown: {
      technicalDepth: 5,
      marketAnalysis: 5,
      implementationPlan: 5,
      innovation: 5,
      resourceFeasibility: 5,
    },
    feedback: "Start discussing your project idea to get a feasibility assessment.",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketGaps, setMarketGaps] = useState<MarketGap[]>([]);
  const [technicalChallenges, setTechnicalChallenges] = useState<TechnicalChallenge[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userProfile = user ? {
    fullName: user.fullName,
    academicYear: user.academicYear,
    interests: user.interests,
    careerGoals: user.careerGoals,
    gpa: user.gpa,
  } : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (supabaseUser) {
      loadSessions();
    }
  }, [supabaseUser]);

  const loadSessions = async () => {
    if (!supabaseUser) return;
    const { data, error } = await supabase
      .from("brainstorm_sessions")
      .select("id, project_focus, created_at")
      .eq("user_id", supabaseUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[CLIENT] Error loading sessions:", error);
      return;
    }

    setSessions(data || []);
    if (data && data.length > 0) {
      setCurrentSessionId(data[0].id);
      loadMessages(data[0].id);
    } else {
      sendWelcomeMessage();
    }
  };

  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("[CLIENT] Error loading messages:", error);
      return;
    }

    const formattedMessages: Message[] = (data || []).map((msg, index) => ({
      id: `${msg.id}-${index}`,
      role: msg.role as "assistant" | "user",
      content: msg.content,
      time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    setMessages(formattedMessages);
    setHasWelcomed(formattedMessages.length > 0);
  };

  const sendWelcomeMessage = useCallback(async () => {
    if (!supabaseUser || hasWelcomed) return;
    
    setIsLoading(true);
    setHasWelcomed(true);

    try {
      const welcomePrompt = userProfile 
        ? `Welcome ${userProfile.fullName}! I see you're a ${userProfile.academicYear || "student"} interested in ${userProfile.interests?.join(", ") || "various fields"}. Let's brainstorm your graduation project. What's on your mind?`
        : "Welcome! I'm your GPSpark AI tutor. I'm here to help you brainstorm, refine, and plan your graduation project. What would you like to work on today?";

      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: welcomePrompt,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("[CLIENT] Welcome message error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseUser, hasWelcomed, userProfile]);

  const createNewSession = async () => {
    if (!supabaseUser) return;
    setCurrentSessionId(null);
    setMessages([]);
    setHasWelcomed(false);
    setShowSidebar(false);
    setTimeout(() => sendWelcomeMessage(), 100);
  };

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadMessages(sessionId);
    setShowSidebar(false);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("brainstorm_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("[CLIENT] Error deleting session:", error);
      return;
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
      setHasWelcomed(false);
      setTimeout(() => sendWelcomeMessage(), 100);
    }
    addNotification("success", "Session Deleted", "The brainstorm session has been removed.");
  };

  const handleSendMessage = async (content?: string) => {
    const messageText = content || messageInput;
    if (!messageText.trim() || isLoading || !supabaseUser) return;

    // Create a session first if none exists
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      const { data, error } = await supabase
        .from("brainstorm_sessions")
        .insert({
          user_id: supabaseUser.id,
          project_focus: "Graduation Project Brainstorming",
        })
        .select()
        .single();

      if (error) {
        console.error("[CLIENT] Error creating session:", error);
        return;
      }

      activeSessionId = data.id;
      setCurrentSessionId(activeSessionId);
      
      // Refresh sessions list
      const { data: sessionsData } = await supabase
        .from("brainstorm_sessions")
        .select("id, project_focus, created_at")
        .eq("user_id", supabaseUser.id)
        .order("created_at", { ascending: false });
      setSessions(sessionsData || []);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageInput("");
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          projectFocus: "Graduation Project Brainstorming",
          sessionId: activeSessionId,
          userId: supabaseUser.id,
          userProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server error (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: Message = {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        content: "",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: assistantContent }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("[BRAINSTEM] Error:", error);
      addNotification("error", "AI Error", "Failed to get response. Please try again.");
      const errorMessage: Message = {
        id: `error-${Date.now() + 1}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const fetchFeasibility = async () => {
    if (messages.length < 2 || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/brainstorm/feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeasibilityData(data);
      }
    } catch (error) {
      console.error("[CLIENT] Feasibility analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchAnalysis = async () => {
    if (messages.length < 2) return;
    
    try {
      const response = await fetch("/api/brainstorm/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (response.ok) {
        const data = await response.json();
        setMarketGaps(data.marketGaps || []);
        setTechnicalChallenges(data.technicalChallenges || []);
      }
    } catch (error) {
      console.error("[CLIENT] Analysis error:", error);
    }
  };

  // Fetch feasibility and analysis after messages change (debounced)
  useEffect(() => {
    if (messages.length >= 2) {
      const timer = setTimeout(() => {
        fetchFeasibility();
        fetchAnalysis();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const exportResearchSummary = async () => {
    if (messages.length === 0) return;
    
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      // Header
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, pageWidth, 45, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("GPSpark Research Summary", margin, 22);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 32);
      doc.text(`Session: ${currentSessionId ? "Active Brainstorm Session" : "New Session"}`, margin, 38);
      
      y = 55;
      doc.setTextColor(30, 30, 30);

      // Feasibility Score Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Feasibility Assessment", margin, y);
      y += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(feasibilityScore >= 70 ? 22 : feasibilityScore >= 40 ? 245 : 220, 
                       feasibilityScore >= 70 ? 163 : feasibilityScore >= 40 ? 158 : 38, 
                       feasibilityScore >= 70 ? 74 : feasibilityScore >= 40 ? 11 : 38);
      doc.text(`Overall Score: ${feasibilityScore}%`, margin, y);
      y += 8;

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const feedbackLines = doc.splitTextToSize(feasibilityData.feedback, contentWidth);
      doc.text(feedbackLines, margin, y);
      y += feedbackLines.length * 6 + 5;

      // Breakdown table
      const breakdownData = [
        ["Technical Depth", `${feasibilityData.breakdown.technicalDepth}/20`],
        ["Market Analysis", `${feasibilityData.breakdown.marketAnalysis}/20`],
        ["Implementation Plan", `${feasibilityData.breakdown.implementationPlan}/20`],
        ["Innovation", `${feasibilityData.breakdown.innovation}/20`],
        ["Resource Feasibility", `${feasibilityData.breakdown.resourceFeasibility}/20`],
      ];

      autoTable(doc, {
        startY: y,
        head: [["Criteria", "Score"]],
        body: breakdownData,
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 15;

      // Market Gaps Section
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Market Gaps Identified", margin, y);
      y += 10;

      if (marketGaps.length > 0) {
        const marketGapData = marketGaps.map(gap => [gap.title, gap.description]);
        autoTable(doc, {
          startY: y,
          head: [["Gap", "Description"]],
          body: marketGapData,
          theme: "striped",
          headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 0: { cellWidth: 50, fontStyle: "bold" }, 1: { cellWidth: contentWidth - 50 } },
          margin: { left: margin, right: margin },
        });
        y = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text("No specific market gaps identified yet.", margin, y);
        y += 15;
      }

      // Technical Challenges Section
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Technical Challenges", margin, y);
      y += 10;

      if (technicalChallenges.length > 0) {
        const challengeData = technicalChallenges.map(ch => [
          ch.title,
          ch.severity.toUpperCase(),
          ch.description
        ]);
        autoTable(doc, {
          startY: y,
          head: [["Challenge", "Severity", "Description"]],
          body: challengeData,
          theme: "striped",
          headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: { 
            0: { cellWidth: 45, fontStyle: "bold" }, 
            1: { cellWidth: 25, halign: "center" },
            2: { cellWidth: contentWidth - 70 } 
          },
          margin: { left: margin, right: margin },
        });
        y = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text("No specific technical challenges identified yet.", margin, y);
        y += 15;
      }

      // Conversation Log Section
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Conversation Log", margin, y);
      y += 10;

      const conversationData = messages.map(msg => [
        msg.role === "user" ? "You" : "AI",
        msg.time,
        msg.content.length > 200 ? msg.content.substring(0, 200) + "..." : msg.content
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Role", "Time", "Message"]],
        body: conversationData,
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        columnStyles: { 
          0: { cellWidth: 15, fontStyle: "bold" }, 
          1: { cellWidth: 20 },
          2: { cellWidth: contentWidth - 35 } 
        },
        margin: { left: margin, right: margin },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      // Footer on all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated by GPSpark AI • Powered by OpenRouter • Page ${i} of ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`gpspark-research-summary-${new Date().toISOString().split('T')[0]}.pdf`);
      addNotification("success", "Export Complete", "Research summary downloaded as PDF.");
    } catch (error) {
      console.error("[CLIENT] Export error:", error);
      addNotification("error", "Export Failed", "Could not generate research summary.");
    } finally {
      setIsExporting(false);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const suggestions = getSuggestions(
    messages.length,
    lastMessage?.role || "assistant",
    user?.interests || []
  );

  // Use API data for feasibility
  const feasibilityScore = feasibilityData.score;
  const feasibilityColor = feasibilityScore >= 70 ? "#16a34a" : feasibilityScore >= 40 ? "#f59e0b" : "#dc2626";
  const feasibilityLabel = feasibilityScore >= 70 ? "High Potential" : feasibilityScore >= 40 ? "Moderate" : "Needs Work";
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (feasibilityScore / 100) * circumference;

  return (
    <ProtectedRoute>
      <div className="h-screen bg-slate-50 overflow-hidden">
        <Sidebar activePage="/brainstorm" />

        <div className="lg:ml-64 flex flex-col h-screen">
          <SimpleHeader />

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Session Sidebar (Desktop) */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white">
              <div className="p-4 border-b border-slate-200">
                <Button
                  onClick={createNewSession}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No sessions yet</p>
                    <p className="text-xs text-slate-400 mt-1">Start a new conversation</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => switchSession(session.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {session.project_focus}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTimeAgo(session.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteSession(session.id, e)}
                        className="p-1 text-slate-400 hover:text-red-500 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </aside>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowSidebar(!showSidebar)}
                      className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                        {currentSessionId ? "Brainstorming Session" : "New Session"}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-600">
                          {currentSessionId 
                            ? `Session active` 
                            : "Start a new conversation or select one"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={createNewSession}
                      variant="outline"
                      className="border-slate-200 text-sm hidden sm:flex"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Session
                    </Button>
                  </div>
                </div>
              </div>

              {/* Session Sidebar (Mobile) */}
              {showSidebar && (
                <div className="lg:hidden border-b border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">Sessions</h3>
                    <Button onClick={createNewSession} variant="outline" className="text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      New
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sessions.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No sessions yet</p>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => switchSession(session.id)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            currentSessionId === session.id
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {session.project_focus}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatTimeAgo(session.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteSession(session.id, e)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Messages Container */}
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
                    <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                      <div className={`rounded-2xl px-5 py-4 ${
                        msg.role === "user"
                          ? "bg-blue-900 text-white"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}>
                        {msg.role === "user" ? (
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <div className="text-sm leading-relaxed prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-100 prose-pre:p-3 prose-pre:rounded">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
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

                {isLoading && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div className="max-w-[70%] flex flex-col items-start">
                      <div className="rounded-2xl px-5 py-4 bg-white border border-slate-200 text-slate-700">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />

                {/* Context-Aware Suggestion Chips */}
                {!isLoading && messages.length > 0 && (
                  <div className="flex flex-wrap gap-3 ml-14">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-900 text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Sparkles className="h-3 w-3" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-200 bg-white p-4 flex-shrink-0">
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your ideas here..."
                    className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <Button 
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !messageInput.trim()}
                    className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

          {/* Right Sidebar - Analysis Panel */}
          <aside className="hidden xl:flex w-80 flex-col border-l border-slate-200 bg-slate-50 overflow-y-auto">
            {/* Project Feasibility */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Project Feasibility</h3>
                <button
                  onClick={fetchFeasibility}
                  disabled={isAnalyzing || messages.length < 2}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Re-analyze feasibility"
                >
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-5 w-5" />}
                </button>
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
                      stroke={feasibilityColor}
                      strokeWidth="8" 
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">{feasibilityScore}%</span>
                    <span className="text-xs text-slate-500 uppercase">{feasibilityLabel}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 text-center mb-4">
                {feasibilityData.feedback}
              </p>

              {/* Breakdown */}
              <div className="space-y-2">
                {[
                  { label: "Technical Depth", value: feasibilityData.breakdown.technicalDepth, max: 20 },
                  { label: "Market Analysis", value: feasibilityData.breakdown.marketAnalysis, max: 20 },
                  { label: "Implementation", value: feasibilityData.breakdown.implementationPlan, max: 20 },
                  { label: "Innovation", value: feasibilityData.breakdown.innovation, max: 20 },
                  { label: "Resource Feasibility", value: feasibilityData.breakdown.resourceFeasibility, max: 20 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-28 truncate">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.value / item.max) * 100}%`,
                          backgroundColor: item.value >= 14 ? "#16a34a" : item.value >= 8 ? "#f59e0b" : "#dc2626",
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 w-8 text-right">{item.value}/{item.max}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Gaps */}
            <div className="p-6 border-b border-slate-200">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Market Gaps Identified
              </h4>
              {marketGaps.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  Discuss your project idea to identify market opportunities.
                </p>
              ) : (
                <div className="space-y-3">
                  {marketGaps.map((gap, index) => (
                    <div key={index} className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-slate-900">{gap.title}</h5>
                          <p className="text-xs text-slate-600 mt-1">{gap.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Technical Challenges */}
            <div className="p-6 border-b border-slate-200">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Technical Challenges
              </h4>
              {technicalChallenges.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  Discuss your project idea to identify technical hurdles.
                </p>
              ) : (
                <div className="space-y-3">
                  {technicalChallenges.map((challenge, index) => (
                    <div 
                      key={index} 
                      className={`bg-white rounded-xl border-l-4 p-4 ${
                        challenge.severity === "high" ? "border-l-red-500" : 
                        challenge.severity === "medium" ? "border-l-amber-500" : "border-l-blue-500"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${
                            challenge.severity === "high" ? "text-red-600" : 
                            challenge.severity === "medium" ? "text-amber-600" : "text-blue-600"
                          }`} />
                          <h5 className={`text-sm font-semibold ${
                            challenge.severity === "high" ? "text-red-700" : 
                            challenge.severity === "medium" ? "text-amber-700" : "text-blue-700"
                          }`}>
                            {challenge.title}
                          </h5>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          challenge.severity === "high" ? "bg-red-100 text-red-700" : 
                          challenge.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {challenge.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{challenge.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <div className="p-6">
              <Button 
                onClick={exportResearchSummary}
                disabled={isExporting || messages.length === 0}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                Export Research Summary
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
