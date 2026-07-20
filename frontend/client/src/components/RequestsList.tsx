import { useQuery } from '@tanstack/react-query';
import { ComponentType } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { api, mockApi } from '../lib/api';
import { MedicineRequest } from '../types';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  RotateCw, 
  Plus, 
  AlertCircle, 
  Clock, 
  Send, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  MessageSquare,
  BookmarkCheck,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface RequestsListProps {
  onBack: () => void;
  onNavigateToService: (serviceId: string) => void;
  onClickRequest: (requestId: number) => void;
}

// French translation map for statuses
export const STATUS_MAP: Record<string, { label: string; bg: string; text: string; icon: ComponentType<any> }> = {
  Pending: { label: 'En attente', bg: 'bg-amber-50 border-amber-150', text: 'text-amber-800', icon: Clock },
  Sent: { label: 'Envoyée', bg: 'bg-blue-50 border-blue-150', text: 'text-blue-800', icon: Send },
  Responded: { label: 'Réponse reçue', bg: 'bg-indigo-50 border-indigo-150', text: 'text-indigo-800', icon: MessageSquare },
  Reserved: { label: 'Réservée', bg: 'bg-teal-50 border-teal-150', text: 'text-teal-800', icon: BookmarkCheck },
  Completed: { label: 'Terminée', bg: 'bg-emerald-50 border-emerald-150', text: 'text-emerald-800', icon: CheckCircle2 },
  Cancelled: { label: 'Annulée', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', icon: XCircle },
  Expired: { label: 'Expirée', bg: 'bg-rose-50 border-rose-150', text: 'text-rose-800', icon: AlertTriangle },
};

export const getStatusDetails = (status: string) => {
  return STATUS_MAP[status] || { label: status, bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', icon: FileText };
};

export default function RequestsList({ onBack, onNavigateToService, onClickRequest }: RequestsListProps) {
  const { isMockMode, xanoApiUrl } = useAuthStore();

  const { data: requests, isLoading, error, refetch } = useQuery<MedicineRequest[]>({
    queryKey: ['myRequests', isMockMode, xanoApiUrl],
    queryFn: async () => {
      if (isMockMode) {
        const res = await mockApi.getMyRequests();
        return res.data;
      } else {
        if (!xanoApiUrl) {
          throw new Error("L'URL de l'API Xano n'est pas configurée dans la barre supérieure 'Config API'.");
        }
        const res = await api.get('/Requests/List_My_Requests');
        return res.data;
      }
    }
  });

  // Helper to format ISO dates safely in French format
  const formatFrenchDate = (dateStr?: string | number) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header section with title and back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
            aria-label="Retour"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mes Demandes</h1>
            <p className="text-xs text-slate-500 font-medium">Consultez l'état de vos demandes de santé</p>
          </div>
        </div>

        {/* Action Button */}
        {requests && requests.length > 0 && (
          <button
            onClick={() => onNavigateToService('product-request')}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Nouvelle demande</span>
          </button>
        )}
      </div>

      {/* Main states container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-teal-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-500 font-mono tracking-wider uppercase">
              Chargement de vos demandes...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 max-w-md mx-auto space-y-6">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-lg">Impossible de charger les demandes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {(error as Error)?.message || "Une erreur inattendue est survenue lors de la récupération des données de l'API Xano."}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <RotateCw size={14} />
              <span>Réessayer la connexion</span>
            </button>
          </div>
        )}

        {/* Success list block */}
        {requests && (
          requests.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16 max-w-sm mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto shadow-inner border border-slate-100">
                <FileText size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-lg">Aucune demande active</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Vous n'avez encore aucune demande.
                </p>
              </div>
              <button
                onClick={() => onNavigateToService('product-request')}
                className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors shadow-md shadow-teal-100 cursor-pointer"
              >
                Nouvelle demande
              </button>
            </div>
          ) : (
            /* List of requests */
            <div className="space-y-4">
              {requests.map((request, idx) => {
                const statusDetails = getStatusDetails(request.status);
                const StatusIcon = statusDetails.icon;
                const formattedDate = formatFrenchDate(request.created_at);
                
                return (
                  <motion.button
                    key={request.id || idx}
                    onClick={() => onClickRequest(request.id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl p-5 text-left transition-all duration-200 hover:border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-3 flex-1">
                      {/* Top metadata */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-black text-slate-400">
                          ID: #{request.id}
                        </span>
                        
                        {/* Request Type tag */}
                        {request.request_type && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                            {request.request_type}
                          </span>
                        )}

                        {/* Date badge */}
                        {formattedDate && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium ml-auto sm:ml-0">
                            <Calendar size={11} />
                            {formattedDate}
                          </span>
                        )}
                      </div>

                      {/* Medicine summary list */}
                      <div className="space-y-1">
                        {request.medicines && request.medicines.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {request.medicines.map((med, mIdx) => (
                              <span 
                                key={mIdx} 
                                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs"
                              >
                                {med.name} <span className="text-[10px] text-slate-400 ml-0.5">x{med.quantity}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 line-clamp-1 italic font-medium">
                            {request.description || "Aucun détail d'article de santé spécifié."}
                          </p>
                        )}
                      </div>

                      {/* Responses stats */}
                      <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                        {request.item_count !== undefined && (
                          <span>
                            {request.item_count} {request.item_count > 1 ? 'médicaments' : 'médicament'}
                          </span>
                        )}
                        {request.response_count !== undefined && (
                          <span className="flex items-center gap-1 text-teal-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            {request.response_count} {request.response_count > 1 ? 'propositions reçues' : 'proposition reçue'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t border-slate-100 pt-3 sm:pt-0 sm:border-none">
                      <div className={`px-3 py-1.5 rounded-xl border ${statusDetails.bg} ${statusDetails.text} text-xs font-bold flex items-center gap-1.5`}>
                        <StatusIcon size={14} className="shrink-0" />
                        <span>{statusDetails.label}</span>
                      </div>
                      
                      {/* Interactive arrow */}
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:border-teal-500/20 transition-all shadow-2xs group-hover:translate-x-0.5">
                        <Plus size={14} className="rotate-45" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
