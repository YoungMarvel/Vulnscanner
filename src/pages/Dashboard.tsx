import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useAuth } from "../AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Scan, Severity } from "../types";
import { motion } from "motion/react";
import { format } from "date-fns";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScans: 0,
    vulnerabilitiesFound: 0,
    criticalIssues: 0,
    recentScans: [] as Scan[],
  });
  const [loading, setLoading] = useState(true);

  const chartData = [
    { name: "Mon", scans: 4 },
    { name: "Tue", scans: 6 },
    { name: "Wed", scans: 8 },
    { name: "Thu", scans: 12 },
    { name: "Fri", scans: 10 },
    { name: "Sat", scans: 11 },
    { name: "Sun", scans: 15 },
  ];

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const scansRef = collection(db, "scans");
        const q = query(
          scansRef, 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        
        const scans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scan));
        
        // This is a bit inefficient for large datasets but works for demo
        let totalVulns = 0;
        scans.forEach(s => totalVulns += s.vulnerabilityCount || 0);

        setStats({
          totalScans: scans.length,
          vulnerabilitiesFound: totalVulns,
          criticalIssues: scans.reduce((acc, s) => acc + (s.vulnerabilityCount > 5 ? 1 : 0), 0), // Mock logic for critical
          recentScans: scans.slice(0, 5),
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111114] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className={cn("absolute right-0 top-0 w-24 h-24 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20", color)} />
      <div className="flex justify-between items-start mb-4">
         <div className={cn("p-3 rounded-xl bg-slate-900 border border-slate-800", color.replace('bg-', 'text-'))}>
           <Icon size={24} />
         </div>
         {trend && (
           <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded text-nowrap">
             +12% TRND
           </span>
         )}
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-white mb-1">{value}</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase underline decoration-cyan-500 decoration-4 underline-offset-8 mb-2">SYSTEM_OVERVIEW</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time protection status for your linked assets.</p>
        </div>
        <Link 
          to="/scan/new" 
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]"
        >
          <Plus size={18} /> New Analysis
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Scans" value={stats.totalScans} icon={Activity} color="bg-cyan-500" trend />
        <StatCard title="Threats Detected" value={stats.vulnerabilitiesFound} icon={ShieldAlert} color="bg-yellow-500" />
        <StatCard title="Critical Nodes" value={stats.criticalIssues} icon={AlertTriangle} color="bg-red-500" />
        <StatCard title="Avg Score" value="72%" icon={ShieldCheck} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Scanning Frequency</h3>
                <div className="flex gap-2 text-[10px] font-bold text-slate-500">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500" /> COMPLETED</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-700" /> PENDING</div>
                </div>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#111114", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" }} 
                      itemStyle={{ color: "#22d3ee" }}
                    />
                    <Area type="monotone" dataKey="scans" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Recent Sessions</h3>
            <div className="space-y-4 flex-1">
              {stats.recentScans.length > 0 ? (
                stats.recentScans.map((scan) => (
                  <Link 
                    key={scan.id} 
                    to={`/scan/results/${scan.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0b] border border-slate-800 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        scan.status === "completed" ? "bg-green-500" : scan.status === "failed" ? "bg-red-500" : "bg-cyan-500 animate-pulse"
                      )} />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold text-slate-200 truncate">{scan.targetUrl.replace(/^https?:\/\//, '')}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">
                          {scan.createdAt?.toDate ? format(scan.createdAt.toDate(), "MMM d, HH:mm") : "Recently"}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="text-slate-700 group-hover:text-cyan-500 transition-colors" size={16} />
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
                  <Clock size={40} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">No Recent Logs</span>
                </div>
              )}
            </div>
            <Link to="/scan/history" className="mt-6 text-center text-[10px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-[0.2em] pt-4 border-t border-slate-800/50">
              EXPAND_ARCHIVES
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// CN helper needed here or in layout
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export default Dashboard;
