import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Download,
  Terminal,
  Activity,
  ArrowLeft,
  Search
} from "lucide-react";
import { db } from "../lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { Scan, Vulnerability, ScanStatus, Severity } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

const ScanResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<Scan | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Listen to scan changes
    const unsubScan = onSnapshot(doc(db, "scans", id), (docSnap) => {
      if (docSnap.exists()) {
        setScan({ id: docSnap.id, ...docSnap.data() } as Scan);
      }
      setLoading(false);
    });

    // Listen to vulnerabilities
    const q = query(collection(db, "scans", id, "vulnerabilities"), orderBy("createdAt", "desc"));
    const unsubVulns = onSnapshot(q, (querySnapshot) => {
      const vulns = querySnapshot.docs.map(vDoc => ({ id: vDoc.id, ...vDoc.data() } as Vulnerability));
      setVulnerabilities(vulns);
    });

    return () => {
      unsubScan();
      unsubVulns();
    };
  }, [id]);

  const severityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL: return "text-red-500 bg-red-500/10 border-red-500/20";
      case Severity.HIGH: return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case Severity.MEDIUM: return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  const severityIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL: return <AlertCircle size={14} />;
      case Severity.HIGH: return <AlertTriangle size={14} />;
      default: return <ShieldAlert size={14} />;
    }
  };

  const handleExportCSV = () => {
    if (!vulnerabilities.length) return;
    const headers = ["Type", "Severity", "Affected Area", "Description", "Recommendation"];
    const rows = vulnerabilities.map(v => [
      v.type,
      v.severity,
      v.affectedArea,
      v.description.replace(/,/g, ';'),
      v.recommendation.replace(/,/g, ';')
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `vuln_report_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex items-center justify-center p-20 text-cyan-500 font-mono tracking-widest uppercase">RETRIEVING_REPORT...</div>;
  if (!scan) return <div className="p-20 text-center text-slate-500">Scan not found. It may have been purged from the system.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-4">
           <Link to="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-cyan-500 transition-colors uppercase tracking-[0.2em] mb-2">
             <ArrowLeft size={12} /> BACK_TO_CONTROL
           </Link>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-4 break-all">
             REPORT::{scan.targetUrl.replace(/^https?:\/\//, '')}
           </h1>
           <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="text-slate-500 w-4 h-4" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {scan.createdAt?.toDate ? format(scan.createdAt.toDate(), "MMM d, yyyy HH:mm:ss") : "Now"}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{scan.status}</span>
              </div>
              <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
                 <Terminal size={12} className="text-cyan-500" />
                 <span className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase font-mono">ID: {scan.id.substring(0, 8)}</span>
              </div>
           </div>
        </div>
        <div className="flex gap-4 self-end md:self-auto">
           <button 
             onClick={handleExportCSV}
             className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-all border border-slate-700"
             title="Download CSV Report"
           >
             <Download size={20} />
           </button>
           <button 
             onClick={handleExportCSV}
             className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]"
           >
             Export CSV
           </button>
        </div>
      </header>

      {/* Progress View if Scanning */}
      {scan.status === ScanStatus.SCANNING && (
        <div className="bg-[#111114] border border-slate-800 rounded-3xl p-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-900 overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-1/3 h-full bg-cyan-600 shadow-[0_0_10px_#0891b2]"
            />
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Animated Sphere */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 animate-ping bg-cyan-500/10 rounded-full" />
              <div className="relative w-40 h-40 bg-[#0a0a0b] border-2 border-cyan-500/30 rounded-full flex items-center justify-center">
                <div className="absolute inset-2 border border-slate-800 rounded-full animate-spin-slow" />
                <Activity size={60} className="text-cyan-500 animate-pulse" />
              </div>
            </div>

            {/* Step Details */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Search size={12} className="animate-spin" /> Engine_Active
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
                  Analyzing_Vector_Integrity
                </h2>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                   <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
                   <span className="text-cyan-400 font-mono text-sm tracking-tight">{scan.currentStep || "Initializing..."}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { label: "Headers Audit", done: !!scan.currentStep?.match(/headers|packets|ports|finalizing/) },
                   { label: "AI Analysis", done: !!scan.currentStep?.match(/packets|ports|finalizing/) },
                   { label: "Port Discovery", done: !!scan.currentStep?.match(/ports|finalizing/) },
                   { label: "Final Report", done: scan.status === ScanStatus.COMPLETED }
                 ].map((step, idx) => (
                   <div key={idx} className={cn(
                     "flex items-center gap-3 p-3 rounded-xl border transition-all",
                     step.done ? "bg-cyan-500/5 border-cyan-500/30 text-cyan-400" : "bg-slate-900/50 border-slate-800 text-slate-600"
                   )}>
                     {step.done ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700 animate-pulse" />}
                     <span className="text-xs font-bold uppercase tracking-wider">{step.label}</span>
                   </div>
                 ))}
              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-500 space-y-1">
                 <div className="flex justify-between"><span>[SYSTEM] Connection Established to Node_01</span> <span className="text-green-500">OK</span></div>
                 <div className="flex justify-between"><span>[SCANNER] Byte stream analysis initiated...</span> <span className="text-green-500">OK</span></div>
                 <div className="flex justify-between"><span>[AI] Gemini logic layer engaged...</span> <span className="text-cyan-500">ACTIVE</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {scan.status === ScanStatus.COMPLETED && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Security Breakdown</h3>
                <div className="space-y-3">
                   {[
                     { label: "Critical", count: vulnerabilities.filter(v => v.severity === Severity.CRITICAL).length, color: "bg-red-500" },
                     { label: "High", count: vulnerabilities.filter(v => v.severity === Severity.HIGH).length, color: "bg-orange-500" },
                     { label: "Medium", count: vulnerabilities.filter(v => v.severity === Severity.MEDIUM).length, color: "bg-yellow-500" },
                     { label: "Low", count: vulnerabilities.filter(v => v.severity === Severity.LOW).length, color: "bg-blue-500" },
                   ].map((lvl) => (
                     <div key={lvl.label} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                          <div className={cn("w-2 h-2 rounded-full", lvl.color)} />
                          {lvl.label}
                        </div>
                        <span className="text-sm font-black text-white">{lvl.count}</span>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Environment</h3>
                <div className="space-y-4 font-mono text-[11px]">
                   <div className="flex justify-between border-b border-slate-800/50 pb-2">
                     <span className="text-slate-500">PROTOCOL</span>
                     <span className="text-cyan-400">{scan.targetUrl.split(':')[0].toUpperCase()}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-800/50 pb-2">
                     <span className="text-slate-500">ENGINE_VER</span>
                     <span className="text-slate-300">V4.12.0-STABLE</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-slate-500">AGENT</span>
                     <span className="text-red-400">VULN_DAEMON_01</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Main Vulnerability List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-4 mb-2">
               <ShieldAlert className="text-cyan-500" size={24} />
               <h2 className="text-xl font-black text-white italic tracking-tight uppercase">DETECTION_LOG_ARTIFACTS ({vulnerabilities.length})</h2>
            </div>

            {vulnerabilities.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {vulnerabilities.map((vuln, index) => (
                    <motion.div
                      key={vuln.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#111114] border-l-4 border border-slate-800 p-6 rounded-r-2xl overflow-hidden group hover:bg-[#15151a] transition-all"
                      style={{ borderLeftColor: vuln.severity === Severity.CRITICAL ? '#ef4444' : vuln.severity === Severity.HIGH ? '#f97316' : vuln.severity === Severity.MEDIUM ? '#eab308' : '#3b82f6' }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="space-y-2">
                          <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border", severityColor(vuln.severity))}>
                            {severityIcon(vuln.severity)} {vuln.severity}
                          </div>
                          <h4 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">{vuln.type}</h4>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600 bg-black/30 px-2 py-1 rounded border border-slate-800 uppercase">
                          POS: {vuln.affectedArea.substring(0, 30)}...
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle size={12} /> Observation
                          </label>
                          <p className="text-slate-400 leading-relaxed">{vuln.description}</p>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-green-500/80 uppercase tracking-widest flex items-center gap-2">
                             <CheckCircle2 size={12} /> Countermeasure
                          </label>
                          <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                            <p className="text-slate-300 leading-relaxed italic">{vuln.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-[#111114] border border-slate-800 rounded-3xl p-16 text-center">
                 <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/20">
                    <ShieldCheck size={40} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">IMMUNE_TARGET</h3>
                 <p className="text-slate-500 max-w-sm mx-auto text-sm">No high-risk vulnerabilities were identified by the current scanner modules. Your security posture appears robust for the selected vectors.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {scan.status === ScanStatus.FAILED && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center text-red-500">
           <AlertCircle size={48} className="mx-auto mb-4" />
           <h3 className="text-xl font-bold uppercase tracking-widest mb-2 font-mono">SCAN_NODE_CRITICAL_FAILURE</h3>
           <p className="text-sm font-medium opacity-80 mb-6">The scanner encountered an unrecoverable error during execution.</p>
           <Link to="/scan/new" className="inline-flex py-3 px-6 rounded-xl bg-red-500 text-white font-bold uppercase tracking-widest text-xs">
             Re-Initialize Probe
           </Link>
        </div>
      )}
    </div>
  );
};

// CN helper needed
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export default ScanResults;
