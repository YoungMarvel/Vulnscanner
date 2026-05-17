import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  History, 
  Search, 
  Filter, 
  ExternalLink, 
  Trash2, 
  AlertCircle,
  FileText,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  MoreVertical
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Scan, ScanStatus } from "../types";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

const ScanHistory: React.FC = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchScans = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "scans"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedScans = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Scan));
      setScans(fetchedScans);
    } catch (err) {
      console.error("Error fetching scans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this scan record?")) return;
    
    try {
      await deleteDoc(doc(db, "scans", id));
      setScans(scans.filter(s => s.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredScans = scans.filter(s => 
    s.targetUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase underline decoration-cyan-500 decoration-4 underline-offset-8 mb-2">SYSTEM_ARCHIVES</h1>
          <p className="text-slate-500 text-sm font-medium">Historical audit logs for all protected assets.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search target vectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111114] border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-cyan-500 outline-none transition-all"
          />
        </div>
      </header>

      <div className="bg-[#111114] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#15151a] border-b border-slate-800">
                <th className="p-4 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Asset_Target</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Findings</th>
                <th className="p-4 pr-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-8"><div className="h-4 bg-slate-900 rounded w-full" /></td>
                    </tr>
                  ))
                ) : filteredScans.length > 0 ? (
                  filteredScans.map((scan) => (
                    <motion.tr 
                      key={scan.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-slate-900/30 transition-colors cursor-pointer"
                    >
                      <td className="p-4 pl-8 font-mono text-xs font-bold text-slate-200">
                         <div className="flex items-center gap-2">
                           <span className="truncate max-w-[200px]">{scan.targetUrl.replace(/^https?:\/\//, '')}</span>
                           <ExternalLink size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-medium">
                        {scan.createdAt?.toDate ? format(scan.createdAt.toDate(), "yyyy-MM-dd HH:mm") : "N/A"}
                      </td>
                      <td className="p-4">
                         <span className={cn(
                           "text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest border",
                           scan.status === "completed" ? "text-green-500 bg-green-500/5 border-green-500/10" : 
                           scan.status === "failed" ? "text-red-500 bg-red-500/5 border-red-500/10" : 
                           "text-cyan-500 bg-cyan-500/5 border-cyan-500/10 animate-pulse"
                         )}>
                           {scan.status}
                         </span>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                           {scan.vulnerabilityCount > 0 ? (
                             <>
                               <ShieldAlert size={14} className="text-yellow-500" />
                               <span className="text-sm font-black text-white">{scan.vulnerabilityCount}</span>
                               <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vulns</span>
                             </>
                           ) : (
                             <span className="text-[10px] text-slate-700 uppercase tracking-widest font-bold font-mono">CLEAR</span>
                           )}
                         </div>
                      </td>
                      <td className="p-4 pr-8 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <Link 
                             to={`/scan/results/${scan.id}`}
                             className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                             title="View Report"
                           >
                             <FileText size={18} />
                           </Link>
                           <button 
                             onClick={(e) => handleDelete(scan.id, e)}
                             className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                             title="Delete Audit"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-slate-600 font-mono italic text-sm tracking-widest">
                      NO_RECORDS_FOUND_IN_BUFFER
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export default ScanHistory;
