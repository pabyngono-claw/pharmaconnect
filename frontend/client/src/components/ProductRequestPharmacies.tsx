import { ArrowLeft, MapPin, ShieldCheck, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductRequestPharmaciesProps {
  onBack: () => void;
}

export default function ProductRequestPharmacies({ onBack }: ProductRequestPharmaciesProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sélection des pharmacies</h1>
          <p className="text-xs text-slate-500 font-medium">Étape 3 : Choisir les officines</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
            ✓
          </span>
          <span className="text-xs font-bold text-slate-600">Médicaments</span>
        </div>
        <div className="h-[1px] bg-slate-200 flex-1 mx-4" />
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
            ✓
          </span>
          <span className="text-xs font-bold text-slate-600">Photo optionnelle</span>
        </div>
        <div className="h-[1px] bg-slate-200 flex-1 mx-4" />
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
            3
          </span>
          <span className="text-xs font-bold text-slate-800">Pharmacies</span>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6 relative overflow-hidden">
        {/* Decorative top strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-600" />

        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-inner border border-teal-100">
          <MapPin size={32} />
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-slate-800">Sélection des pharmacies</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Cette étape sera développée prochainement.
          </p>
        </div>

        {/* Feature Disclaimer Banner */}
        <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-3.5 text-slate-700 text-left">
          <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Note technique
            </p>
            <p className="text-xs font-semibold leading-relaxed">
              Vos informations de médicaments et de photo sont conservées en toute sécurité. Vous pouvez utiliser le bouton de retour pour vérifier ou mettre à jour vos sélections.
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm transition-colors text-center cursor-pointer"
          >
            Retour
          </button>
        </div>
      </div>

      {/* Trust banner */}
      <div className="text-center flex items-center justify-center space-x-2 text-[11px] text-slate-400">
        <ShieldCheck size={14} />
        <span>Données chiffrées de bout en bout</span>
      </div>
    </div>
  );
}
