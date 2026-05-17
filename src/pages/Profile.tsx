import React, { useState } from "react";
import { User, Mail, Shield, Key, Camera, Check, AlertCircle } from "lucide-react";
import { useAuth } from "../AuthContext";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion } from "motion/react";

const Profile: React.FC = () => {
  const { profile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName });
      setMessage({ type: "success", text: "Operator profile updated successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await updatePassword(user, newPassword);
      setMessage({ type: "success", text: "Security key rotated successfully." });
      setNewPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: "Re-authentication may be required for password changes." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase underline decoration-cyan-500 decoration-4 underline-offset-8 mb-2">OPERATOR_PROFILE</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your network identity and security credentials.</p>
      </header>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "p-4 rounded-xl border flex items-center gap-3 text-sm font-bold uppercase tracking-wide",
            message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
           <div className="bg-[#111114] border border-slate-800 rounded-3xl p-8 text-center">
              <div className="relative inline-block mb-4">
                 <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-3xl font-black text-cyan-500 shadow-[0_0_30px_rgba(8,145,178,0.2)]">
                   {displayName?.[0] || user?.email?.[0]}
                 </div>
                 <button className="absolute bottom-0 right-0 p-2 bg-cyan-600 rounded-full text-white hover:bg-cyan-500 transition-colors border-2 border-[#111114]">
                   <Camera size={14} />
                 </button>
              </div>
              <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tighter">{displayName}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{profile?.role} NODE</p>
           </div>

           <div className="bg-[#111114] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Network Integrity</span>
                <span className="text-green-500">OPTIMAL</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full w-[94%] bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
              </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-8">
           <section className="bg-[#111114] border border-slate-800 rounded-3xl p-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
               <User size={14} className="text-cyan-500" /> Identity Information
             </h3>
             <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Callsign (Display Name)</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Authority (Read Only)</label>
                  <input 
                    type="email" 
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-[#0a0a0b] border border-slate-700 rounded-xl px-4 py-3 text-slate-600 outline-none transition-all text-sm font-mono cursor-not-allowed"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Sync Identity
                </button>
             </form>
           </section>

           <section className="bg-[#111114] border border-slate-800 rounded-3xl p-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
               <Key size={14} className="text-red-500" /> Security Override
             </h3>
             <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Secret Key</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter complex key..."
                    className="w-full bg-[#0a0a0b] border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-all text-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !newPassword}
                  className="bg-slate-800 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Rotate Key
                </button>
             </form>
           </section>
        </div>
      </div>
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

export default Profile;
