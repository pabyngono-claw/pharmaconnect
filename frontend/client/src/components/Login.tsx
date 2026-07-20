import React, { useState } from 'react';
import { useAuthStore, validateSenegalPhone } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { Phone, ArrowRight, Settings, CheckCircle2, AlertCircle, Info, Database, HelpCircle } from 'lucide-react';

export default function Login() {
  const { requestOtp, isLoading, error, clearError, xanoApiUrl, setXanoApiUrl, isMockMode, setMockMode } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Local phone validation for UX feedback
  const isValid = validateSenegalPhone(phoneNumber) !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await requestOtp(phoneNumber);
  };

  return (
    <div id="login_page" className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-4">
      {/* Settings Panel Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-all text-xs font-medium cursor-pointer"
        >
          <Settings size={14} className={showSettings ? 'rotate-90 transition-transform' : ''} />
          <span>Config API</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Developer / Configuration Drawer */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-md space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database size={14} className="text-teal-600" />
                Configuration Backend (Xano)
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-bold">Options</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block text-slate-700">Mode Démo (Mock API)</span>
                  <span className="text-slate-400">Simule les réponses Xano sans serveur</span>
                </div>
                <button
                  onClick={() => setMockMode(!isMockMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isMockMode ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isMockMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {!isMockMode && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">URL de base de l'API Xano</label>
                  <input
                    type="text"
                    value={xanoApiUrl}
                    onChange={(e) => setXanoApiUrl(e.target.value)}
                    placeholder="https://x8ki-letl-twmt.n7.xano.io/api:xxxxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400">
                    Sera utilisé pour les requêtes réelles. Les endpoints doivent être sous <code>/auth/...</code>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Bienvenue sur PharmaConnect
            </h2>
            <p className="text-sm text-slate-500">
              Saisissez votre numéro de téléphone pour vous connecter ou créer un compte.
            </p>
          </div>

          {/* Banner showing active Mode */}
          <div className={`p-3 rounded-xl flex items-center gap-2 text-xs border ${
            isMockMode 
              ? 'bg-amber-50/50 border-amber-100 text-amber-800' 
              : 'bg-teal-50/50 border-teal-100 text-teal-800'
          }`}>
            <Info size={14} className="shrink-0" />
            <span>
              {isMockMode 
                ? "Mode Démo activé. Utilisez n'importe quel numéro du Sénégal. Code d'accès OTP: 123456."
                : "Connexion directe avec votre serveur de production Xano."}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="phone_input" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Numéro de téléphone (Sénégal)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 font-medium border-r border-slate-200 pr-3 text-sm">
                  <Phone size={15} />
                  +221
                </span>
                <input
                  id="phone_input"
                  type="text"
                  placeholder="77 123 45 67"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (error) clearError();
                  }}
                  className="w-full pl-24 pr-10 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium text-slate-800 transition-colors text-base"
                  disabled={isLoading}
                />
                
                {phoneNumber && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {isValid ? (
                      <CheckCircle2 size={18} className="text-teal-600 animate-scale-up" />
                    ) : (
                      <HelpCircle size={18} className="text-slate-300" />
                    )}
                  </span>
                )}
              </div>

              {/* Phone validation guide helper */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-slate-400">
                  Ex: 77 123 45 67, 76 987 65 43, etc.
                </span>
                {phoneNumber && (
                  <span className={`text-[11px] font-semibold ${isValid ? 'text-teal-600' : 'text-slate-400'}`}>
                    {isValid ? 'Format Sénégalais valide' : 'Format invalide'}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={`w-full py-4 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-white shadow-md transition-all cursor-pointer ${
                isValid && !isLoading
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-100'
                  : 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Demande en cours...</span>
                </div>
              ) : (
                <>
                  <span>Obtenir le code OTP</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security badges & terms */}
        <div className="text-center text-[11px] text-slate-400 space-y-1 py-2">
          <p>En continuant, vous acceptez les conditions de PharmaConnect.</p>
          <p>Protection des données médicales conforme aux normes locales.</p>
        </div>
      </div>
    </div>
  );
}
