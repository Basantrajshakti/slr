import { create } from "zustand";

interface ZustandStore {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  toggleLoading: () => void;
}

// Create the store
export const useZustandStore = create<ZustandStore>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  toggleLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));

// Optional: Utility to use with route changes or async operations
export const withLoading = async <T>(
  task: Promise<T>,
  setLoading = useZustandStore.getState().setLoading,
): Promise<T> => {
  setLoading(true);
  try {
    const result = await task;
    setLoading(false);
    return result;
  } catch (error) {
    setLoading(false);
    throw error;
  }
};
