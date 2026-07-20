import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { Activity, ShieldCheck } from 'lucide-react';

export default function Splash() {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    // Run session restoration check after a short stylish delay
    const timer = setTimeout(() => {
      restoreSession();
    }, 1500);

    return () => clearTimeout(timer);
  }, [restoreSession]);

  return (
    <div id="splash_screen" className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-6">
      <div className="text-center space-y-6 max-w-md w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-600 text-white shadow-lg mx-auto"
        >
          <Activity size={40} className="animate-pulse" />
        </motion.div>

        <div className="space-y-2">
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            PharmaConnect
          </motion.h1>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-slate-500 font-medium text-sm"
          >
            Connexion santé instantanée & sécurisée
          </motion.p>
        </div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="flex space-x-1.5 justify-center">
            <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-bounce"></div>
          </div>
          <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Chargement de votre session...</span>
        </motion.div>

        {/* Footer info showing security status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-12 flex items-center justify-center space-x-2 text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 max-w-xs mx-auto"
        >
          <ShieldCheck size={16} />
          <span className="text-xs font-semibold">Chiffrement de bout en bout</span>
        </motion.div>
      </div>
    </div>
  );
}
