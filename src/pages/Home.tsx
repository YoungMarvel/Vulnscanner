import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Server, Activity, ArrowRight, Zap, Globe, Cpu } from "lucide-react";
import { motion } from "motion/react";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070708] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(8,145,178,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[linear-gradient(to_bottom,rgba(8,145,178,0.05),transparent)] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="text-cyan-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(8,145,178,0.5)]" />
          <span className="font-bold text-2xl tracking-tighter text-white">VULNSCAN<span className="italic text-cyan-500">PRO</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium hover:text-cyan-400 transition-colors">Sign In</Link>
          <Link to="/register" className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-20 pb-32 px-6 max-w-5xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-6">
            <Zap size={14} /> Next-Gen Security Intelligence
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[1.05] mb-8">
            Secure Your Assets <br />
            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#22d3ee,#0891b2)]">In Real-Time.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            Advanced vulnerability scanning for modern web infrastructures. Detect SQLi, XSS, and misconfigurations with AI-powered precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group scale-105">
              Launch Security Console <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 font-bold hover:bg-slate-800 transition-all">
              View Capabilities
            </a>
          </div>
        </motion.div>
      </header>

      {/* Dashboard Preview */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto -mt-10 overflow-hidden">
        <motion.div
           initial={{ opacity: 0, y: 40, scale: 0.95 }}
           whileInView={{ opacity: 1, y: 0, scale: 1 }}
           viewport={{ once: true }}
           className="bg-[#111114] border border-slate-800 rounded-3xl p-4 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
        >
          <div className="bg-[#0a0a0b] border border-slate-800 rounded-2xl p-6 aspect-video flex flex-col gap-6">
             <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="h-2 w-48 bg-slate-800 rounded-full" />
             </div>
             <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-24 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse" />
                ))}
             </div>
             <div className="flex-1 bg-slate-900/30 rounded-xl border border-slate-800 flex items-center justify-center">
                <Activity className="text-cyan-500/20 w-32 h-32" />
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">Enterprise-Grade Scanner Engine</h2>
          <p className="text-slate-400">Our multi-vector scanning technology leaves no stone unturned.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Lock, title: "SQL Injection", desc: "Heuristic analysis for persistent and reflected SQL injection vectors." },
            { icon: Globe, title: "XSS Detection", desc: "Full DOM and server-side script injection detection in real-time." },
            { icon: Server, title: "Security Headers", desc: "Comprehensive audit of CSP, HSTS, and X-Frame security configurations." },
            { icon: Cpu, title: "Asset Discovery", desc: "Identify open ports and services exposed to the public internet." },
          ].map((feat, i) => (
            <motion.div 
               key={i}
               whileHover={{ y: -5 }}
               className="bg-[#111114] border border-slate-800 p-8 rounded-2xl hover:border-cyan-500/50 transition-colors"
            >
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6 text-cyan-400">
                <feat.icon />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-sm text-slate-400 line-height-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32 px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10 tracking-tight">Ready to harden your security?</h2>
          <p className="text-cyan-100 mb-10 relative z-10 font-medium">Join thousands of security professionals protecting their edge today.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-cyan-800 px-10 py-5 rounded-2xl font-bold hover:bg-cyan-50 transition-all shadow-xl relative z-10 uppercase tracking-widest text-sm">
            Start Free Scan <Shield size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-900 py-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center bg-[#070708]">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Shield className="text-cyan-500 w-5 h-5" />
          <span className="font-bold text-lg tracking-tighter text-white">VULNSCAN<span className="italic text-cyan-500">PRO</span></span>
        </div>
        <p className="text-xs text-slate-600">© 2026 VulnScan Pro. Defensive security for modern internet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
