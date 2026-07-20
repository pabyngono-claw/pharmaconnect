import { useState } from 'react';
import { useProductRequestStore, MedicineDraft } from '../store/useProductRequestStore';
import { z } from 'zod';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, HelpCircle, Check, Info } from 'lucide-react';

interface ProductRequestFormProps {
  onBack: () => void;
  onContinue: () => void;
}

const medicineSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom du médicament est obligatoire.')
    .max(150, 'Le nom ne doit pas dépasser 150 caractères.'),
  quantity: z
    .number()
    .int()
    .min(1, 'La quantité doit être supérieure à zéro.')
    .max(99, 'La quantité maximale est de 99.'),
  preferredBrand: z
    .string()
    .max(150, 'La marque ne doit pas dépasser 150 caractères.')
    .optional()
    .or(z.literal('')),
  allowGeneric: z.boolean(),
  additionalInfo: z
    .string()
    .max(500, 'Les informations ne doivent pas dépasser 500 caractères.')
    .optional()
    .or(z.literal('')),
});

export default function ProductRequestForm({ onBack, onContinue }: ProductRequestFormProps) {
  const { medicines, addMedicine, removeMedicine, updateMedicine } = useProductRequestStore();
  const [errors, setErrors] = useState<Record<number, Partial<Record<keyof MedicineDraft, string>>>>({});

  const handleFieldChange = (idx: number, field: keyof MedicineDraft, value: any) => {
    updateMedicine(idx, field, value);
    // Clear error for this field dynamically once modified
    if (errors[idx]?.[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        if (updated[idx]) {
          const itemErrors = { ...updated[idx] };
          delete itemErrors[field];
          if (Object.keys(itemErrors).length === 0) {
            delete updated[idx];
          } else {
            updated[idx] = itemErrors;
          }
        }
        return updated;
      });
    }
  };

  const handleContinue = () => {
    const newErrors: Record<number, Partial<Record<keyof MedicineDraft, string>>> = {};
    let hasError = false;

    medicines.forEach((med, idx) => {
      const result = medicineSchema.safeParse(med);
      if (!result.success) {
        hasError = true;
        const itemErrors: Partial<Record<keyof MedicineDraft, string>> = {};
        result.error.issues.forEach((err) => {
          const path = err.path[0] as keyof MedicineDraft;
          itemErrors[path] = err.message;
        });
        newErrors[idx] = itemErrors;
      }
    });

    setErrors(newErrors);

    if (!hasError) {
      onContinue();
    } else {
      // Scroll to the first error
      const firstErrorIdx = Object.keys(newErrors).map(Number).sort((a, b) => a - b)[0];
      if (firstErrorIdx !== undefined) {
        const element = document.getElementById(`section-med-${firstErrorIdx}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Demande de Produit</h1>
          <p className="text-xs text-slate-500 font-medium">Étape 1 : Saisir les articles requis</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <span className="text-xs font-bold text-slate-800">Médicaments</span>
        </div>
        <div className="h-[1px] bg-slate-200 flex-1 mx-4" />
        <div className="flex items-center space-x-2 opacity-50">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">
            2
          </span>
          <span className="text-xs font-bold text-slate-600">Photo optionnelle</span>
        </div>
      </div>

      {/* Medicines list forms */}
      <div className="space-y-6">
        {medicines.map((med, idx) => {
          const itemErrors = errors[idx] || {};
          const remainingChars = 500 - (med.additionalInfo?.length || 0);

          return (
            <motion.div
              id={`section-med-${idx}`}
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 relative"
            >
              {/* Card Title & Delete Button */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-teal-50 text-teal-700 text-xs font-black px-2.5 py-1 rounded-lg">
                    Médicament {idx + 1}
                  </span>
                </div>
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeMedicine(idx)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Supprimer ce médicament"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Medicine Name input */}
              <div className="space-y-1.5">
                <label
                  htmlFor={`med-name-${idx}`}
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Nom du médicament *
                </label>
                <input
                  id={`med-name-${idx}`}
                  type="text"
                  value={med.name}
                  maxLength={150}
                  onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                  placeholder="Ex: Paracétamol 500mg, Amoxicilline..."
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-hidden focus:bg-white focus:ring-2 transition-all ${
                    itemErrors.name
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-teal-100 focus:border-teal-500'
                  }`}
                />
                {itemErrors.name && (
                  <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-rose-600" />
                    {itemErrors.name}
                  </p>
                )}
              </div>

              {/* Quantity selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantité *
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.max(1, med.quantity - 1);
                        handleFieldChange(idx, 'quantity', val);
                      }}
                      className="w-11 h-11 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center font-extrabold text-lg transition-colors shadow-2xs cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span className="w-14 text-center font-black text-base text-slate-800 font-mono">
                      {med.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.min(99, med.quantity + 1);
                        handleFieldChange(idx, 'quantity', val);
                      }}
                      className="w-11 h-11 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center font-extrabold text-lg transition-colors shadow-2xs cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Boîte(s) ou unité(s) requise(s)
                  </span>
                </div>
                {itemErrors.quantity && (
                  <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-rose-600" />
                    {itemErrors.quantity}
                  </p>
                )}
              </div>

              {/* Grid for optional fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Preferred Brand */}
                <div className="space-y-1.5">
                  <label
                    htmlFor={`med-brand-${idx}`}
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Marque préférée (Optionnel)
                  </label>
                  <input
                    id={`med-brand-${idx}`}
                    type="text"
                    value={med.preferredBrand}
                    maxLength={150}
                    onChange={(e) => handleFieldChange(idx, 'preferredBrand', e.target.value)}
                    placeholder="Ex: Doliprane, Sanofi..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                  />
                  {itemErrors.preferredBrand && (
                    <p className="text-xs font-bold text-rose-600 mt-1">
                      {itemErrors.preferredBrand}
                    </p>
                  )}
                </div>

                {/* Generic medicine switch / checkbox */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-150 p-4 rounded-2xl select-none">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-slate-800">
                      Générique autorisé
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 block leading-tight">
                      Autoriser un équivalent moins cher
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange(idx, 'allowGeneric', !med.allowGeneric)}
                    className={`w-12 h-7 rounded-full transition-colors relative focus:outline-hidden ${
                      med.allowGeneric ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-md ${
                        med.allowGeneric ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Additional Information Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor={`med-info-${idx}`}
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Informations supplémentaires (Optionnel)
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {remainingChars} car. restants
                  </span>
                </div>
                <textarea
                  id={`med-info-${idx}`}
                  rows={3}
                  value={med.additionalInfo}
                  maxLength={500}
                  onChange={(e) => handleFieldChange(idx, 'additionalInfo', e.target.value)}
                  placeholder="Instructions spécifiques, dosage requis, ordonnance..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all resize-none"
                />
                {itemErrors.additionalInfo && (
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    {itemErrors.additionalInfo}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Button to add another medicine (max 10) */}
      {medicines.length < 10 ? (
        <button
          type="button"
          onClick={addMedicine}
          className="w-full py-4 bg-white border-2 border-dashed border-slate-300 text-slate-600 hover:border-teal-500 hover:text-teal-700 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer group hover:bg-teal-50/20"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          <span>Ajouter un autre médicament</span>
        </button>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-150 rounded-2xl flex items-start gap-3.5 text-amber-900">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">
            Vous avez atteint la limite de 10 médicaments par demande de produit.
          </p>
        </div>
      )}

      {/* Footer / Navigation Buttons */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row gap-3 shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl font-bold text-sm transition-colors text-center cursor-pointer"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-3.5 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-bold text-sm transition-colors text-center shadow-md shadow-teal-100 cursor-pointer"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
