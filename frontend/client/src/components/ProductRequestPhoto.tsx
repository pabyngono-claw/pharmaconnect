import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useProductRequestStore } from '../store/useProductRequestStore';
import { ArrowLeft, Camera, Image as ImageIcon, Trash2, CheckCircle, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductRequestPhotoProps {
  onBack: () => void;
  onContinue: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ProductRequestPhoto({ onBack, onContinue }: ProductRequestPhotoProps) {
  const { attachedImage, setAttachedImage } = useProductRequestStore();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Helper to format byte sizes
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} Ko`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const handleFile = (file: File) => {
    setError(null);

    // Validate type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("Le format de fichier n'est pas supporté. Veuillez utiliser du JPG, JPEG, PNG ou WEBP.");
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError("Le fichier dépasse la taille maximale autorisée de 5 Mo.");
      return;
    }

    // Read file as base64 data URL for state persistence
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage({
          name: file.name,
          size: file.size,
          dataUrl: reader.result,
        });
      }
    };
    reader.onerror = () => {
      setError("Une erreur s'est produite lors de la lecture du fichier.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraSelect = () => {
    cameraInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setAttachedImage(null);
    setError(null);
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        id="file-input"
        type="file"
        accept={SUPPORTED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        id="camera-input"
        type="file"
        accept={SUPPORTED_TYPES.join(',')}
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ajouter une photo</h1>
          <p className="text-xs text-slate-500 font-medium">Étape 2 : Joindre une ordonnance ou boîte</p>
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
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
            2
          </span>
          <span className="text-xs font-bold text-slate-800">Photo optionnelle</span>
        </div>
      </div>

      {/* Upload card container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        {/* Decorative top strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-600" />

        {/* Drag & drop upload area */}
        {!attachedImage ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-teal-500 bg-teal-50/30'
                : 'border-slate-300 bg-slate-50/50 hover:border-teal-500/50 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100">
              <Camera size={24} />
            </div>

            <p className="text-sm font-bold text-slate-800 mb-1">
              Glissez-déposez votre image ici
            </p>
            <p className="text-xs text-slate-400 font-medium mb-6">
              Formats supportés : JPG, JPEG, PNG, WEBP (Max 5 Mo)
            </p>

            {/* Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={triggerCameraSelect}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm cursor-pointer"
              >
                <Camera size={16} />
                <span>Prendre une photo</span>
              </button>

              <button
                type="button"
                onClick={triggerFileSelect}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-2xs cursor-pointer"
              >
                <ImageIcon size={16} />
                <span>Choisir une image</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Image Preview Layout */
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5 bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-150 text-left">
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-bold">Image chargée avec succès.</span>
            </div>

            {/* Visual preview box */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col sm:flex-row items-center p-4 gap-5">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white relative">
                <img
                  src={attachedImage.dataUrl}
                  alt={`Aperçu de ${attachedImage.name}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 w-full">
                <p className="text-sm font-bold text-slate-800 truncate" title={attachedImage.name}>
                  {attachedImage.name}
                </p>
                <p className="text-xs font-mono font-bold text-slate-400">
                  Taille : {formatSize(attachedImage.size)}
                </p>

                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Changer la photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100/50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Supprimer la photo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback block */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-start gap-3 text-rose-900 text-left">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Erreur de validation
              </p>
              <p className="text-xs font-semibold leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Informational Help Banner */}
        <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-3.5 text-slate-700 text-left">
          <HelpCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pourquoi ajouter une photo ?
            </p>
            <p className="text-xs font-semibold leading-relaxed">
              Une ordonnance lisible permet au pharmacien de valider plus rapidement la conformité médicale de votre demande avant la mise de côté.
            </p>
          </div>
        </div>

        {/* Footer / Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl font-bold text-sm transition-colors text-center cursor-pointer"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-3.5 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-bold text-sm transition-colors text-center shadow-md shadow-teal-100 cursor-pointer"
          >
            Continuer
          </button>
        </div>
      </div>

      {/* Trust banner */}
      <div className="text-center flex items-center justify-center space-x-2 text-[11px] text-slate-400">
        <ShieldCheck size={14} />
        <span>Données de santé confidentielles et hébergées HDS</span>
      </div>
    </div>
  );
}
