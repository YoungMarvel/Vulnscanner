import React, { useEffect, useState } from "react";
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  Settings, 
  Trash2, 
  UserPlus, 
  Search,
  Lock,
  Unlock,
  Terminal,
  ShieldCheck,
  AlertOctagon,
  Clock,
  ExternalLink
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, getDocs, doc, deleteDoc, updateDoc, orderBy, limit, onSnapshot } from "firebase/firestore";
import { UserProfile, Scan, SystemLog } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { logActivity } from "../lib/logger";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    criticalVulns: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");

  useEffect(() => {
    // Real-time Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const usersData = snap.docs.map(d => d.data() as UserProfile);
      setUsers(usersData);
      setGlobalStats(prev => ({ ...prev, totalUsers: usersData.length }));
    });

    // Real-time Logs
    const unsubLogs = onSnapshot(query(collection(db, "logs"), orderBy("createdAt", "desc"), limit(50)), (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as SystemLog)));
    });

    // Stats for scans
    const fetchScanStats = async () => {
      const scansSnap = await getDocs(collection(db, "scans"));
      const scans = scansSnap.docs.map(d => d.data() as Scan);
      setGlobalStats(prev => ({
        ...prev,
        totalScans: scans.length,
        criticalVulns: scans.reduce((acc, s) => acc + (s.vulnerabilityCount > 5 ? 1 : 0), 0),
      }));
    };

    fetchScanStats();
    setLoading(false);

    return () => {
      unsubUsers();
      unsubLogs();
    };
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("CRITICAL: This will permanently purge the user and all associated security data. Proceed?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      await logActivity(`Admin purged user profile: ${userId}`);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const toggleAdmin = async (user: UserProfile) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await updateDoc(doc(db, "users", user.uid), { role: newRole });
      await logActivity(`Admin changed role for ${user.displayName} to ${newRole}`);
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const AdminStat = ({ title, value, color }: any) => (
    <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
      <div className={cn("absolute right-0 top-0 w-20 h-20 blur-[50px] opacity-10", color)} />
      <span className="text-3xl font-black text-white mb-1 block tracking-tighter">{value}</span>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase underline decoration-red-500 decoration-4 underline-offset-8 mb-2">ADMIN_ROOT_ACCESS</h1>
          <p className="text-slate-500 text-sm font-medium">Global system management and governance controls.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setActiveTab("users")} className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === "users" ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "text-slate-500 hover:text-slate-200 bg-slate-900 border border-slate-800")}>
             User_Registry
           </button>
           <button onClick={() => setActiveTab("logs")} className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === "logs" ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "text-slate-500 hover:text-slate-200 bg-slate-900 border border-slate-800")}>
             System_Logs
           </button>
        </div>
      </header>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStat title="Identified Users" value={globalStats.totalUsers} color="bg-cyan-500" />
        <AdminStat title="Total Audit Sessions" value={globalStats.totalScans} color="bg-yellow-500" />
        <AdminStat title="Critical Thresholds" value={globalStats.criticalVulns} color="bg-red-500" />
      </div>

      {activeTab === "users" ? (
        <div className="bg-[#111114] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#15151a]">
             <div className="flex items-center gap-2">
               <Users className="text-red-500 w-5 h-5" />
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Active Operators</h3>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3 h-3" />
                <input type="text" placeholder="Filter UID..." className="bg-[#0a0a0b] border border-slate-800 rounded-lg py-1.5 pl-8 pr-4 text-[10px] text-white outline-none focus:border-red-500" />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="p-4 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">UID_Address</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Clearance</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Registered</th>
                  <th className="p-4 pr-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Access_Rights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 pl-8">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-red-500 border border-slate-700 uppercase">
                           {u.displayName?.[0]}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-white">{u.displayName}</span>
                           <span className="text-[10px] text-slate-600">{u.email}</span>
                         </div>
                       </div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500 uppercase tracking-tighter">
                      {u.uid.substring(0, 16)}...
                    </td>
                    <td className="p-4">
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border",
                         u.role === "admin" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-slate-900 text-slate-500 border-slate-800"
                       )}>
                         {u.role}
                       </span>
                    </td>
                    <td className="p-4 text-[10px] text-slate-400 font-medium">
                      {u.createdAt?.toDate ? format(u.createdAt.toDate(), "yyyy-MM-dd") : "Legacy"}
                    </td>
                    <td className="p-4 pr-8 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => toggleAdmin(u)}
                           className="p-2 text-slate-600 hover:text-cyan-500 hover:bg-slate-800 rounded-lg transition-all"
                           title={u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                         >
                           {u.role === "admin" ? <Lock size={16} /> : <Unlock size={16} />}
                         </button>
                         <button 
                           onClick={() => handleDeleteUser(u.uid)}
                           className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                           title="Purge Identity"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#111114] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-[#15151a] flex items-center gap-2">
             <Clock className="text-cyan-500 w-5 h-5" />
             <h3 className="text-sm font-bold text-white uppercase tracking-widest">System Event History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="p-4 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Event_Description</th>
                  <th className="p-4 pr-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operator_UID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30 font-mono">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 pl-8 text-[10px] text-cyan-500 whitespace-nowrap">
                      {log.createdAt?.toDate ? format(log.createdAt.toDate(), "yyyy.MM.dd HH:mm:ss") : "STREAMING..."}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-200">
                      {log.activity}
                    </td>
                    <td className="p-4 pr-8 text-[10px] text-slate-600 text-right">
                      {log.userId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="p-20 text-center text-slate-600 uppercase tracking-[0.3em] animate-pulse">
                No system events recorded in the current buffer
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export default AdminDashboard;
