import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Search, 
  History, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Lock
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const Layout: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "New Scan", icon: Search, path: "/scan/new" },
    { label: "Scan History", icon: History, path: "/scan/history" },
    { label: "Profile", icon: User, path: "/profile" },
  ];

  if (isAdmin) {
    navItems.push({ label: "Admin Panel", icon: Lock, path: "/admin" });
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-slate-300 font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="fixed left-0 top-0 bottom-0 z-50 bg-[#111114] border-r border-slate-800 flex flex-col transition-all duration-300"
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-cyan-600 rounded flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(8,145,178,0.4)]">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl tracking-tight text-slate-100 whitespace-nowrap"
              >
                VULNSCAN<span className="text-cyan-500 italic">PRO</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all group",
                location.pathname === item.path 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", location.pathname === item.path ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400")} />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={cn("flex items-center gap-3 p-3 mb-2 rounded-lg bg-slate-900/50", !isSidebarOpen && "justify-center")}>
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
               {profile?.displayName?.[0] || "U"}
             </div>
             {isSidebarOpen && (
               <div className="flex flex-col overflow-hidden">
                 <span className="text-sm font-medium text-slate-200 truncate">{profile?.displayName}</span>
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest">{profile?.role}</span>
               </div>
             )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-[#111114] border border-slate-800 rounded-full p-1 text-slate-500 hover:text-cyan-400 z-50"
        >
          {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </motion.aside>

      <main className={cn("flex-1 transition-all duration-300", isSidebarOpen ? "ml-[260px]" : "ml-[80px]")}>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
