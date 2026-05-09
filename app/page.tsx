import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, BarChart3, Users, MessageSquare, Shield, TrendingUp, Library, Bell, User, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="GPSpark Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-slate-900">GPSpark</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
              Homepage
            </Link>
            <Link href="/library" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Library
            </Link>
            <Link href="/team" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Team Formation
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="bg-transparent text-sm outline-none w-40"
              />
            </div>
            <Bell className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900" />
            <User className="h-5 w-5 text-slate-600 cursor-pointer hover:text-slate-900" />
            <Button className="bg-blue-900 hover:bg-blue-800 text-white">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              FCAI GRADUATION HUB
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Transform Your Graduation Project into a{" "}
              <span className="text-green-600">Market Ready</span> Venture.
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              GPSpark bridges the gap between academic theory and market reality. 
              Use AI-driven insights to refine your ideas, find the perfect team, 
              and build a project that stands out to recruiters and investors.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-5 text-base">
                Start Your Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="px-6 py-5 text-base border-slate-300">
                View Project Library
              </Button>
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-slate-600">
                Join <span className="font-semibold text-slate-900">200+</span> students already collaborating
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl">
              <div className="rounded-lg bg-slate-800 p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Dashboard</span>
                  <span className="text-slate-400 text-sm">6:13</span>
                </div>
                <div className="space-y-3">
                  <div className="h-20 rounded bg-blue-600/20 border border-blue-500/30 p-3">
                    <div className="h-2 w-24 bg-blue-500/40 rounded mb-2"></div>
                    <div className="h-2 w-16 bg-blue-500/30 rounded"></div>
                  </div>
                  <div className="h-12 rounded bg-slate-700/50 border border-slate-600/30"></div>
                  <div className="h-12 rounded bg-slate-700/50 border border-slate-600/30"></div>
                  <div className="h-12 rounded bg-slate-700/50 border border-slate-600/30"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Master Your Project Journey
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From the first spark of an idea to the final presentation, GPSpark provides 
            the specialized tools required for capstone success.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Brainstorming</h3>
            <p className="text-slate-600 text-sm mb-4">
              Overcome writer's block with intelligent suggestions based on current industry 
              trends and academic requirements.
            </p>
            <Link href="/brainstorm" className="text-blue-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
              Explore AI Tools
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Market Analysis</h3>
            <p className="text-slate-600 text-sm mb-4">
              Validate your project scope with real-world data. Understand the competitive 
              landscape and pinpoint your unique value.
            </p>
            <Link href="/library" className="text-green-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
              View Data Sets
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Team Building</h3>
            <p className="text-slate-600 text-sm mb-4">
              Find collaborators whose skills complement yours. Browse student profiles 
              based on tech stacks and project interests.
            </p>
            <Link href="/team" className="text-purple-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
              Search Members
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Library & Features Grid */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24 bg-slate-50">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <Library className="h-8 w-8 mb-4 text-blue-300" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Global Library of Graduation Projects
              </h3>
              <p className="text-blue-100 mb-6">
                Browse thousands of successful capstone projects from alumni across top universities.
              </p>
              <Button className="bg-white text-blue-900 hover:bg-blue-50">
                Search Library
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <MessageSquare className="h-6 w-6 text-blue-600 mb-3" />
                <h4 className="font-semibold text-slate-900 mb-1">Mentor Feedback</h4>
                <p className="text-sm text-slate-600">Get instant reviews from industry experts.</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <Shield className="h-6 w-6 text-amber-600 mb-3" />
                <h4 className="font-semibold text-slate-900 mb-1">Academic Integrity</h4>
                <p className="text-sm text-slate-600">Check plagiarism and originality.</p>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-2xl p-6 flex flex-col justify-between col-span-2">
              <div>
                <TrendingUp className="h-6 w-6 text-green-600 mb-3" />
                <h4 className="font-semibold text-slate-900 mb-1">Industry Trends 2024</h4>
                <p className="text-sm text-slate-600">Stay updated with latest market demands.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to lead your own project?
            </h2>
            <p className="text-blue-100 mb-8">
              Join GPSpark today and turn your academic requirements into your first career milestone.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-amber-400 text-blue-900 hover:bg-amber-300 px-8 py-5 text-base font-semibold">
                Create Free Account
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-5 text-base">
                Talk to an Advisor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="GPSpark Logo" className="w-8 h-8" />
              <div>
                <span className="text-lg font-bold text-slate-900">GPSpark</span>
                <span className="text-slate-500 text-sm ml-2">FCAI</span>
              </div>
            </div>
            
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href="/about" className="hover:text-slate-900">About</Link>
              <Link href="/methodology" className="hover:text-slate-900">Methodology</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
              <Link href="/support" className="hover:text-slate-900">Contact Support</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">© 2024 GPSpark FCAI. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
