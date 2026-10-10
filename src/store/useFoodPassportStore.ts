import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TriedFoodMap = Record<string, boolean>;

interface FoodPassportState {
  triedFoods: TriedFoodMap;
  selectedDistrictId: string | null;
  toggleFood: (districtId: string, foodId: string) => void;
  setSelectedDistrictId: (id: string | null) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (payload: string) => boolean;
}

const storageKey = "foodie-passport-progress";

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const useFoodPassportStore = create<FoodPassportState>()(
  persist(
    (set) => ({
      triedFoods: {},
      selectedDistrictId: null,
      toggleFood: (districtId, foodId) =>
        set((state) => {
          const key = `${districtId}:${foodId}`;
          const current = state.triedFoods[key] ?? false;
          return {
            triedFoods: {
              ...state.triedFoods,
              [key]: !current,
            },
          };
        }),
      setSelectedDistrictId: (id) => set({ selectedDistrictId: id }),
      resetProgress: () => set({ triedFoods: {}, selectedDistrictId: null }),
      exportProgress: () => {
        if (typeof window === "undefined") {
          return JSON.stringify({ triedFoods: {} }, null, 2);
        }

        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
          return JSON.stringify({ triedFoods: {} }, null, 2);
        }

        try {
          const parsed = JSON.parse(raw) as { state?: { triedFoods?: Record<string, boolean> } };
          return JSON.stringify({ triedFoods: parsed?.state?.triedFoods ?? {} }, null, 2);
        } catch {
          return JSON.stringify({ triedFoods: {} }, null, 2);
        }
      },
      importProgress: (payload) => {
        try {
          const parsed = JSON.parse(payload) as { triedFoods?: Record<string, boolean> };
          if (!parsed || typeof parsed !== "object" || !parsed.triedFoods || typeof parsed.triedFoods !== "object") {
            return false;
          }
          const validEntries = Object.entries(parsed.triedFoods).reduce((acc, [key, value]) => {
            if (typeof key === "string" && typeof value === "boolean") {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, boolean>);
          set({ triedFoods: validEntries });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : window.localStorage)),
      partialize: (state) => ({ triedFoods: state.triedFoods, selectedDistrictId: state.selectedDistrictId }),
    },
  ),
);

export default useFoodPassportStore;
