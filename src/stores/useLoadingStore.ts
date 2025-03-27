import { create } from "zustand";

interface ZustandStore {
  isLoading: boolean;
  userNames: string[];
  setLoading: (loading: boolean) => void;
  toggleLoading: () => void;
  setUserNames: (names: string[]) => void;
}

// Create the store
export const useZustandStore = create<ZustandStore>((set) => ({
  isLoading: false,
  userNames: [],
  setLoading: (loading) => set({ isLoading: loading }),
  toggleLoading: () => set((state) => ({ isLoading: !state.isLoading })),
  setUserNames: (names) => set({ userNames: names }),
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
