import { useState, ComponentType, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, ChevronRight, ArrowLeft, ClipboardList, ShoppingBag, Stethoscope, MapPin, CalendarDays, UserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RequestsList from './RequestsList';
import RequestDetails from './RequestDetails';
import ProductRequestForm from './ProductRequestForm';
import ProductRequestPhoto from './ProductRequestPhoto';
import ProductRequestPharmacies from './ProductRequestPharmacies';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<any>;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'patient-requests',
    title: 'Mes Demandes',
    description: 'Suivre vos demandes, réponses et réservations.',
    icon: ClipboardList,
  },
  {
    id: 'product-request',
    title: 'Demande de Produit',
    description: 'Rechercher un médicament disponible dans plusieurs pharmacies.',
    icon: ShoppingBag,
  },
  {
    id: 'prescription-renewal',
    title: "Renouvellement d'Ordonnance",
    description: 'Envoyer votre ordonnance pour obtenir un renouvellement.',
    icon: ClipboardList,
  },
  {
    id: 'equipment-request',
    title: "Demande d'Équipement Médical",
    description: 'Rechercher du matériel médical disponible.',
    icon: Stethoscope,
  },
  {
    id: 'nearby-pharmacies',
    title: 'Pharmacies près de moi',
    description: 'Afficher les pharmacies proches de votre position.',
    icon: MapPin,
  },
  {
    id: 'duty-pharmacies',
    title: 'Pharmacies de garde',
    description: 'Trouver les pharmacies de garde actuellement ouvertes.',
    icon: CalendarDays,
  },
  {
    id: 'profile',
    title: 'Mon Profil',
    description: 'Modifier vos informations personnelles.',
    icon: UserRound,
  },
];

const parsePath = (path: string): { page: string; id: number | null } => {
  if (path === '/patient/requests') {
    return { page: 'patient-requests', id: null };
  }
  const match = path.match(/^\/patient\/requests\/(\d+)/);
  if (match) {
    return { page: 'patient-requests-detail', id: parseInt(match[1], 10) };
  }
  if (path === '/patient/request/product') {
    return { page: 'product-request-form', id: null };
  }
  if (path === '/patient/request/product/photo') {
    return { page: 'product-request-photo', id: null };
  }
  if (path === '/patient/request/product/pharmacies') {
    return { page: 'product-request-pharmacies', id: null };
  }
  if (path === '/' || path === '') {
    return { page: 'home', id: null };
  }
  const pageId = path.substring(1);
  const exists = SERVICES.some(s => s.id === pageId);
  if (exists) {
    if (pageId === 'product-request') {
      return { page: 'product-request-form', id: null };
    }
    return { page: pageId, id: null };
  }
  return { page: 'home', id: null };
};

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  
  const [activePage, setActivePage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parsePath(window.location.pathname);
      return parsed.page;
    }
    return 'home';
  });

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parsePath(window.location.pathname);
      return parsed.id;
    }
    return null;
  });

  const navigateToPage = (pageId: string, requestId: number | null = null) => {
    let resolvedPage = pageId;
    if (pageId === 'product-request') {
      resolvedPage = 'product-request-form';
    }
    
    setActivePage(resolvedPage);
    setSelectedRequestId(requestId);
    if (typeof window !== 'undefined') {
      if (resolvedPage === 'patient-requests') {
        window.history.pushState(null, '', '/patient/requests');
      } else if (resolvedPage === 'patient-requests-detail' && requestId !== null) {
        window.history.pushState(null, '', `/patient/requests/${requestId}`);
      } else if (resolvedPage === 'product-request-form') {
        window.history.pushState(null, '', '/patient/request/product');
      } else if (resolvedPage === 'product-request-photo') {
        window.history.pushState(null, '', '/patient/request/product/photo');
      } else if (resolvedPage === 'product-request-pharmacies') {
        window.history.pushState(null, '', '/patient/request/product/pharmacies');
      } else if (resolvedPage === 'home') {
        window.history.pushState(null, '', '/');
      } else {
        window.history.pushState(null, '', `/${resolvedPage}`);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePath(window.location.pathname);
      setActivePage(parsed.page);
      setSelectedRequestId(parsed.id);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const phoneDisplay = user?.phone || '221771234567';
  // Extract first letter or digit for the rounded profile avatar
  const profileInitial = phoneDisplay.replace('+', '').charAt(0) || 'P';

  const currentService = SERVICES.find((s) => s.id === activePage);

  return (
    <div id="patient_dashboard_container" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <span className="font-black text-sm font-mono">P</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              PharmaConnect
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-200 text-sm font-semibold cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {activePage === 'home' ? (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Profile Card Banner */}
              <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
                
                <div className="flex items-center space-x-4">
                  {/* Rounded Profile Avatar */}
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-extrabold text-xl shadow-inner shrink-0 font-mono">
                    {profileInitial}
                  </div>
                  <div className="space-y-1">
                    <span className="text-teal-200 text-xs font-semibold uppercase tracking-widest block">
                      Bonjour
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-mono">
                      {phoneDisplay}
                    </h2>
                  </div>
                </div>

                <div className="bg-teal-950/40 backdrop-blur-sm border border-teal-700/50 rounded-2xl px-5 py-3 text-xs space-y-1 sm:max-w-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-teal-300">Rôle d'accès :</span>
                    <span className="font-bold text-white">{user?.role || 'Patient'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-teal-300">Statut du compte :</span>
                    <span className="text-emerald-400 font-bold">Vérifié par OTP</span>
                  </div>
                </div>
              </div>

              {/* Title Header */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Nos Services de Santé
                </h3>
                <p className="text-xs text-slate-500">
                  Sélectionnez une option ci-dessous pour démarrer vos démarches.
                </p>
              </div>

              {/* Grid of 6 Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {SERVICES.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <motion.button
                      key={service.id}
                      onClick={() => navigateToPage(service.id)}
                      whileHover={{ y: -4, scale: 1.01, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white border border-slate-200 rounded-2xl p-6 text-left flex flex-col justify-between h-48 shadow-sm transition-all duration-200 hover:border-teal-500/50 cursor-pointer group relative"
                    >
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                          <IconComponent size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-teal-900 transition-colors duration-200 text-base">
                            {service.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end text-slate-400 group-hover:text-teal-600 transition-colors pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-1">
                          Ouvrir
                        </span>
                        <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : activePage === 'patient-requests' ? (
            <motion.div
              key="requests-list-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <RequestsList
                onBack={() => navigateToPage('home')}
                onNavigateToService={(serviceId) => navigateToPage(serviceId)}
                onClickRequest={(requestId) => navigateToPage('patient-requests-detail', requestId)}
              />
            </motion.div>
          ) : activePage === 'patient-requests-detail' ? (
            <motion.div
              key="request-details-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <RequestDetails
                requestId={selectedRequestId || 0}
                onBack={() => navigateToPage('patient-requests')}
              />
            </motion.div>
          ) : activePage === 'product-request-form' ? (
            <motion.div
              key="product-request-form-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ProductRequestForm
                onBack={() => navigateToPage('home')}
                onContinue={() => navigateToPage('product-request-photo')}
              />
            </motion.div>
          ) : activePage === 'product-request-photo' ? (
            <motion.div
              key="product-request-photo-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ProductRequestPhoto
                onBack={() => navigateToPage('product-request-form')}
                onContinue={() => navigateToPage('product-request-pharmacies')}
              />
            </motion.div>
          ) : activePage === 'product-request-pharmacies' ? (
            <motion.div
              key="product-request-pharmacies-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ProductRequestPharmacies
                onBack={() => navigateToPage('product-request-photo')}
              />
            </motion.div>
          ) : (
            /* Premium Placeholder View */
            <motion.div
              key="placeholder-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto py-12"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-center relative overflow-hidden">
                {/* Visual Top Decorative Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-600" />

                {/* Back Button */}
                <div className="flex justify-start">
                  <button
                    onClick={() => navigateToPage('home')}
                    className="inline-flex items-center space-x-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Retour au menu principal</span>
                  </button>
                </div>

                {/* Placeholder Content */}
                <div className="space-y-6 py-6 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                    {currentService && <currentService.icon size={32} />}
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      {currentService?.title}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      Cette fonctionnalité sera développée prochainement.
                    </p>
                  </div>
                </div>

                {/* Information Card Banner */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-slate-500 text-center uppercase tracking-wider">Note informative</p>
                  <p>
                    Nos équipes techniques travaillent activement pour intégrer ce module à PharmaConnect.
                    Votre numéro de téléphone restera sauvegardé pour accéder directement à ce service dès son lancement.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer System Signature */}
      <footer className="py-8 bg-white border-t border-slate-200/80 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <p>&copy; 2026 PharmaConnect. Tous droits réservés.</p>
          <p className="mt-1">Connecté de manière sécurisée en tant que Patient.</p>
        </div>
      </footer>
    </div>
  );
}
