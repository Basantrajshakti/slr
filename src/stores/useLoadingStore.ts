import { create } from "zustand";

// Define the store's state and actions
interface LoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  toggleLoading: () => void;
}

// Create the store
export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  toggleLoading: () => set((state) => ({ isLoading: !state.isLoading })),
}));

// Optional: Utility to use with route changes or async operations
export const withLoading = async <T>(
  task: Promise<T>,
  setLoading = useLoadingStore.getState().setLoading,
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
