import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Shield, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({ type: "success", text: "RECOVERY_LINK_DISPATCHED. Check your secure inbox for instructions." });
    } catch (err: any) {
      setMessage({ type: "error", text: "VULNERABILITY_DETECTED: Address not found or communication error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 relative overflow-hidden text-slate-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111114] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Shield className="text-cyan-500 w-8 h-8" />
            <span className="font-bold text-xl text-white">VULNSCAN<span className="text-cyan-500 italic">PRO</span></span>
          </Link>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">KEY_RECOVERY</h2>
          <p className="text-slate-500 text-sm font-medium">Reset your encrypted security credentials.</p>
        </div>

        {message.text ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-2xl border flex flex-col items-center text-center gap-4 ${
              message.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
            <span className="text-xs font-black uppercase tracking-widest leading-relaxed">{message.text}</span>
            <Link to="/login" className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Entry
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Email_Authority</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0a0a0b] border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-800"
                  placeholder="operator@security.pro"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
            >
              {loading ? "TRANSMITTING..." : (
                <>INITIATE_RECOVERY <Send size={16} /></>
              )}
            </button>

            <div className="flex justify-center">
              <Link to="/login" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-cyan-400 transition-all uppercase tracking-[0.2em]">
                <ArrowLeft size={12} /> ABORT_MISSION
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
