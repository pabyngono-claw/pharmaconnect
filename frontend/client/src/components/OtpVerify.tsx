import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function OtpVerify() {
  const { verifyOtp, requestOtp, phone, maskedPhone, otpText, isLoading, error, clearError, isMockMode } = useAuthStore();
  const [otp, setOtp] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus the input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || isLoading) return;
    await verifyOtp(otp);
  };

  const handleResend = async () => {
    if (phone) {
      setOtp('');
      await requestOtp(phone);
    }
  };

  // Helper to pre-fill test OTP for demo purposes
  const handlePrefill = () => {
    if (otpText) {
      setOtp(otpText);
    } else if (isMockMode) {
      setOtp('123456');
    }
  };

  // Return to Login Page
  const handleBackToLogin = () => {
    clearError();
    useAuthStore.setState({ view: 'login' });
  };

  return (
    <div id="otp_verification_page" className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <div>
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Changer de numéro</span>
          </button>
        </div>

        {/* OTP Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Vérification de sécurité
            </h2>
            <p className="text-sm text-slate-500">
              Un code de validation à 6 chiffres a été envoyé au <strong className="text-slate-700">{maskedPhone || phone || 'votre numéro'}</strong>
            </p>
          </div>

          {/* Test OTP Helper Banner */}
          {(otpText || isMockMode) && (
            <motion.button
              type="button"
              onClick={handlePrefill}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between text-teal-800 text-xs font-medium hover:bg-teal-100/70 transition-colors text-left cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-teal-600 shrink-0" />
                <span>Code OTP Démo disponible: <strong>{otpText || '123456'}</strong></span>
              </span>
              <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Saisir</span>
            </motion.button>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center block">
                Saisissez le code d'authentification
              </label>

              {/* Styled input layout */}
              <div className="relative max-w-xs mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={6}
                  pattern="\d*"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    if (error) clearError();
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-default select-none z-10"
                  disabled={isLoading}
                />
                
                {/* Visual OTP box representation */}
                <div className="flex justify-between gap-2.5">
                  {Array.from({ length: 6 }).map((_, index) => {
                    const digit = otp[index] || '';
                    const isFocused = otp.length === index;
                    return (
                      <div
                        key={index}
                        className={`w-11 h-14 border rounded-xl flex items-center justify-center font-bold text-xl transition-all ${
                          isFocused
                            ? 'border-teal-500 ring-2 ring-teal-500/10 scale-105'
                            : digit
                            ? 'border-slate-300 bg-slate-50/50 text-slate-800'
                            : 'border-slate-200 text-slate-300'
                        }`}
                      >
                        {digit}
                        {!digit && isFocused && (
                          <span className="w-0.5 h-6 bg-teal-600 animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
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
              disabled={otp.length !== 6 || isLoading}
              className={`w-full py-4 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-white shadow-md transition-all cursor-pointer ${
                otp.length === 6 && !isLoading
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-100'
                  : 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Vérification...</span>
                </div>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Confirmer le code</span>
                </>
              )}
            </button>
          </form>

          {/* Resend Actions */}
          <div className="border-t border-slate-100 pt-5 text-center space-y-2">
            <span className="text-xs text-slate-400">Vous n'avez pas reçu le code ?</span>
            <div>
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                Renvoyer un nouveau code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
