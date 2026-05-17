import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { logActivity } from "../lib/logger";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await logActivity("Operator session initiated via email/key");
      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      await logActivity("Operator session initiated via Google Auth");
      navigate("/dashboard");
    } catch (err: any) {
      setError("Google authentication failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 relative overflow-hidden">
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
          <h2 className="text-2xl font-bold text-white mb-2">Access Portal</h2>
          <p className="text-slate-500 text-sm">Enter your credentials to enter the security console.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Authority</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0a0a0b] border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all"
                placeholder="operator@security.pro"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0a0a0b] border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-slate-500 hover:text-cyan-500 uppercase tracking-widest transition-colors">
              Forgot Secret Key?
            </Link>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)] disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "INITIATE SESSION"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800">
           <button 
             onClick={handleGoogleLogin}
             className="w-full border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3"
           >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
             Google Sign In
           </button>
        </div>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          New operator? <Link to="/register" className="text-cyan-500 hover:underline">Apply for account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
