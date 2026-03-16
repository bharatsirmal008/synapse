
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Zap, Target, BookOpen, Briefcase, Map, FileText, Sparkles, Shield, Menu, X, Rocket } from 'lucide-react';
import Ballpit from '../src/components/Ballpit';

const Landing: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors">
      {/* Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Synapse Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300" />
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Synapse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#news" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">News</a>
            <a href="#contact" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Contact</a>
            <div className="w-px h-5 bg-gray-200 dark:bg-slate-800"></div>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold hover:bg-brand-600 dark:hover:bg-brand-100 transition-all hover:-translate-y-0.5 shadow-lg shadow-gray-900/20 dark:shadow-none"
            >
              Log In
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full inset-x-0 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 p-6 space-y-4 animate-in slide-in-from-top-4">
            <a href="#news" className="block text-lg font-semibold text-gray-600 dark:text-gray-300">News</a>
            <a href="#contact" className="block text-lg font-semibold text-gray-600 dark:text-gray-300">Contact</a>
            <hr className="border-gray-100 dark:border-slate-800" />
            <Link to="/login" className="block w-full py-3 text-center bg-brand-600 text-white rounded-xl font-bold">
              Log In
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden min-h-[75vh] flex flex-col justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 block h-full w-full">
          <Ballpit
            count={50}
            gravity={0.7}
            friction={0.8}
            wallBounce={0.8}
            followCursor={true}
            colors={[0x8B5CF6, 0x06B6D4, 0xF0ABFC]}
          />
        </div>
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/80 backdrop-blur-[1px] pointer-events-none z-0"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-slate-900/50 border border-brand-100 dark:border-brand-900/30 text-brand-700 dark:text-brand-400 text-[11px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm mb-8 animate-in fade-in zoom-in duration-1000">
            <Sparkles size={12} className="fill-brand-500/20" /> AI-Powered Smart Study Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[0.95] mx-auto max-w-5xl">
            Study Smarter with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-400 dark:from-violet-400 dark:via-purple-400 dark:to-cyan-300 relative">
              AI Power.
              {/* Underline decoration */}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-300 dark:text-brand-700 opacity-50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Emotional Hook */}
          <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Stop cramming. Start understanding.
          </p>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Synapse uses AI to generate quizzes from your notes, summarize lectures, analyze your exam performance, and build personalized study plans — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Link
              to="/login"
              className="group px-8 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started for Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all hover:border-gray-300 dark:hover:border-slate-700">
              See How It Works
            </button>
          </div>


          {/* Dashboard Mockup Removed */}

        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-32 bg-white dark:bg-slate-950 border-y dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl font-black dark:text-white flex items-center gap-4">
                The Study Struggle
              </h2>
              <p className="text-gray-500 text-lg">Most students drown in notes, cram before exams, and never study efficiently. Synapse fixes that.</p>
              <div className="grid gap-4">
                {[
                  { icon: <XCircle className="text-red-500" />, text: "Piles of unorganized lecture notes" },
                  { icon: <XCircle className="text-red-500" />, text: "No idea what's important for exams" },
                  { icon: <XCircle className="text-red-500" />, text: "Can't track academic performance over time" },
                  { icon: <XCircle className="text-red-500" />, text: "No personalized study plan or schedule" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-slate-900 rounded-2xl text-gray-600 dark:text-gray-400 font-bold border dark:border-slate-800">
                    {item.icon} {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-brand-500 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl border dark:border-slate-800 shadow-2xl">
                <h3 className="text-2xl font-black mb-8 dark:text-white flex items-center gap-3">
                  <Shield className="text-brand-600" /> Synapse Solution
                </h3>
                <div className="space-y-6">
                  <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-900/30">
                    <p className="text-sm font-black text-brand-700 dark:text-brand-400 mb-1">AI QUIZ MAKER</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Generate quizzes from any topic or your own notes instantly.</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                    <p className="text-sm font-black text-green-700 dark:text-green-400 mb-1">NOTES SUMMARIZER</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get key points, important terms, and likely exam questions from your notes.</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <p className="text-sm font-black text-purple-700 dark:text-purple-400 mb-1">EXAM PREP PLANNER</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI-generated study schedules tailored to your upcoming exams.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="Synapse Logo" className="w-10 h-10 object-contain" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">&copy; 2026 Synapse. Empowering students to study smarter, not harder.</p>
        </div>
      </footer>
    </div>
  );
};

const ModuleCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border dark:border-slate-800 hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-500 transition-all hover:-translate-y-1">
    <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 transition-colors">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{description}</p>
  </div>
);

export default Landing;
