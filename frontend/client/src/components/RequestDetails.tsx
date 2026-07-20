import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { MedicineRequest } from '../types';
import { getStatusDetails } from './RequestsList';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Calendar, CheckSquare, Info, ShieldCheck } from 'lucide-react';

interface RequestDetailsProps {
  requestId: number;
  onBack: () => void;
}

export default function RequestDetails({ requestId, onBack }: RequestDetailsProps) {
  const queryClient = useQueryClient();
  const { isMockMode, xanoApiUrl } = useAuthStore();

  // Try to find the request in the cache to display rich visual mockup details
  const cachedRequests = queryClient.getQueryData<MedicineRequest[]>(['myRequests', isMockMode, xanoApiUrl]);
  const request = cachedRequests?.find((r) => r.id === requestId);

  const statusDetails = request ? getStatusDetails(request.status) : null;
  const StatusIcon = statusDetails?.icon;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Détails de la demande</h1>
          <p className="text-xs text-slate-500 font-medium">Référence de suivi santé</p>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        {/* Decorative top strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-600" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Identifiant de la demande
            </span>
            <h2 className="text-2xl font-black text-slate-900 font-mono">
              #{requestId}
            </h2>
          </div>

          {/* Status badge */}
          {statusDetails && StatusIcon && (
            <div className={`px-3 py-1.5 rounded-xl border ${statusDetails.bg} ${statusDetails.text} text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-center`}>
              <StatusIcon size={14} />
              <span>{statusDetails.label}</span>
            </div>
          )}
        </div>

        {/* Rich Cache Details if available */}
        {request ? (
          <div className="space-y-5">
            {request.request_type && (
              <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Catégorie</span>
                <span className="col-span-2 font-bold text-slate-800">{request.request_type}</span>
              </div>
            )}

            {request.created_at && (
              <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Date de création</span>
                <span className="col-span-2 font-bold text-slate-800">
                  {new Date(request.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            {/* Medicines List summary */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Articles demandés
              </span>
              
              {request.medicines && request.medicines.length > 0 ? (
                <div className="space-y-2">
                  {request.medicines.map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <CheckSquare size={16} className="text-teal-600 shrink-0" />
                        <span className="text-sm font-bold text-slate-800">{med.name}</span>
                      </div>
                      <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-bold font-mono">
                        Qté: {med.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-150">
                  {request.description || "Aucun article spécifique n'a été répertorié."}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Basic description fallback if not in cache */
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Consultation des données en direct depuis l'API Xano.
            </p>
          </div>
        )}

        {/* Feature Disclaimer Banner */}
        <div className="p-4 bg-teal-50 border border-teal-150 rounded-2xl flex items-start gap-3.5 text-teal-900">
          <Info size={18} className="text-teal-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Information système
            </p>
            <p className="text-xs font-semibold leading-relaxed">
              Cette page sera connectée prochainement.
            </p>
          </div>
        </div>

        {/* Actions panel */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm transition-colors text-center cursor-pointer"
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
