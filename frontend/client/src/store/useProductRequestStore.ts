import { create } from 'zustand';

export interface MedicineDraft {
  name: string;
  quantity: number;
  preferredBrand: string;
  allowGeneric: boolean;
  additionalInfo: string;
}

interface AttachedImageMetadata {
  name: string;
  size: number;
  dataUrl: string;
}

interface ProductRequestState {
  medicines: MedicineDraft[];
  attachedImage: AttachedImageMetadata | null;
  setMedicines: (medicines: MedicineDraft[]) => void;
  addMedicine: () => void;
  removeMedicine: (index: number) => void;
  updateMedicine: (index: number, field: keyof MedicineDraft, value: any) => void;
  setAttachedImage: (image: AttachedImageMetadata | null) => void;
  clearStore: () => void;
}

const DEFAULT_MEDICINE: MedicineDraft = {
  name: '',
  quantity: 1,
  preferredBrand: '',
  allowGeneric: true,
  additionalInfo: '',
};

export const useProductRequestStore = create<ProductRequestState>((set) => ({
  medicines: [{ ...DEFAULT_MEDICINE }],
  attachedImage: null,
  
  setMedicines: (medicines) => set({ medicines }),
  
  addMedicine: () => set((state) => {
    if (state.medicines.length >= 10) return state; // Maximum 10 medicines
    return {
      medicines: [...state.medicines, { ...DEFAULT_MEDICINE }],
    };
  }),
  
  removeMedicine: (index) => set((state) => {
    if (index === 0) return state; // Do not allow first medicine to be removed
    const nextMedicines = [...state.medicines];
    nextMedicines.splice(index, 1);
    return { medicines: nextMedicines };
  }),
  
  updateMedicine: (index, field, value) => set((state) => {
    const nextMedicines = [...state.medicines];
    nextMedicines[index] = {
      ...nextMedicines[index],
      [field]: value,
    };
    return { medicines: nextMedicines };
  }),
  
  setAttachedImage: (image) => set({ attachedImage: image }),
  
  clearStore: () => set({
    medicines: [{ ...DEFAULT_MEDICINE }],
    attachedImage: null,
  }),
}));
