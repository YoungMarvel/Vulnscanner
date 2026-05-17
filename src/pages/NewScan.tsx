import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Globe, 
  ShieldAlert, 
  Terminal, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Search,
  Scan as ScanIcon
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ScanStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";

const NewScan: React.FC = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [scanTypes, setScanTypes] = useState<string[]>(["Headers", "SQLi", "XSS"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Simple URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL including protocol (e.g., https://example.com)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create Scan record in Firestore (Status: Pending)
      const scanRef = await addDoc(collection(db, "scans"), {
        userId: user.uid,
        targetUrl: url,
        types: scanTypes,
        status: ScanStatus.PENDING,
        createdAt: serverTimestamp(),
        vulnerabilityCount: 0,
      });

      // 2. Call backend API to initiate scan logic
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl: url,
          userId: user.uid,
          scanId: scanRef.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach scanner node. Please check your network or try again later.");
      }

      // Briefly show success before navigating
      setTimeout(() => {
        navigate(`/scan/results/${scanRef.id}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during scan initialization.");
      setLoading(false);
    }
  };

  const toggleType = (type: string) => {
    if (scanTypes.includes(type)) {
      setScanTypes(scanTypes.filter(t => t !== type));
    } else {
      setScanTypes([...scanTypes, type]);
    }
  };

  const ScanOption = ({ id, icon: Icon, title, desc }: any) => (
    <button
      type="button"
      onClick={() => toggleType(id)}
      className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left group ${
        scanTypes.includes(id) 
          ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.1)]" 
          : "bg-[#111114] border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className={`p-3 rounded-xl ${scanTypes.includes(id) ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-500 group-hover:text-cyan-400"}`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className={`text-sm font-bold uppercase tracking-wide mb-1 ${scanTypes.includes(id) ? "text-white" : "text-slate-400"}`}>{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase underline decoration-cyan-500 decoration-4 underline-offset-8 mb-2">INITIATE_PROBE</h1>
        <p className="text-slate-500 text-sm font-medium">Configure scanning parameters and target vector.</p>
      </header>

      <form onSubmit={handleStartScan} className="space-y-8">
        {/* Target URL */}
        <div className="bg-[#111114] border border-slate-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="text-cyan-500 w-5 h-5" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">TARGET_DESTINATION</h3>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <Terminal className="text-cyan-500 w-5 h-5" />
              <div className="w-[1px] h-6 bg-slate-800" />
            </div>
            <input 
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full bg-[#0a0a0b] border border-slate-800 rounded-2xl py-6 pl-20 pr-6 text-xl font-mono text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
              placeholder="https://vulnerable.site.com"
              required
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
               <AlertCircle size={16} /> ERROR: {error}
            </div>
          )}
        </div>

        {/* Scan Modules */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-4">
              <ScanIcon className="text-cyan-500 w-5 h-5" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">DETECTION_MODULES</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ScanOption 
               id="Headers" 
               title="Security Headers" 
               icon={Lock} 
               desc="Examine server response headers for common misconfigurations like CSP, X-Frame, and HSTS." 
             />
             <ScanOption 
               id="XSS" 
               title="Script Injections" 
               icon={Terminal} 
               desc="Check for cross-site scripting vulnerabilities and potential payload reflection points." 
             />
             <ScanOption 
               id="SQLi" 
               title="Database Vectors" 
               icon={ShieldAlert} 
               desc="Analyze input vectors for SQL injection risks and database structure leaks." 
             />
             <ScanOption 
               id="Ports" 
               title="Port Discovery" 
               icon={Activity} 
               desc="Simulate port scanning to identify exposed services on common technical ports." 
             />
           </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !url}
          className="w-full group relative overflow-hidden"
        >
          <div className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all duration-500 ${
            loading ? "bg-slate-800 text-slate-500" : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_20px_50px_rgba(8,145,178,0.3)]"
          }`}>
             <AnimatePresence mode="wait">
               {loading ? (
                 <motion.div 
                    key="scanning"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-3"
                 >
                    <Search className="animate-spin" size={20} /> INITIALIZING_SCAN_ENGINE...
                 </motion.div>
               ) : (
                 <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                 >
                    <Activity size={20} /> START_SECURITY_PROBE
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
        </button>
      </form>
    </div>
  );
};

export default NewScan;
