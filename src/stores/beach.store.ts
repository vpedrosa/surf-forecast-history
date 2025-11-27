import { create } from 'zustand';
import { Beach } from '@/types/beach';

interface BeachState {
  beaches: Beach[];
  selectedBeach: Beach | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  setBeaches: (beaches: Beach[]) => void;
  setSelectedBeach: (beach: Beach | null) => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasSearched: (hasSearched: boolean) => void;
  clearSearch: () => void;
}

export const useBeachStore = create<BeachState>((set) => ({
  beaches: [],
  selectedBeach: null,
  searchQuery: '',
  isLoading: false,
  error: null,
  hasSearched: false,
  setBeaches: (beaches) => set({ beaches }),
  setSelectedBeach: (beach) => set({ selectedBeach: beach }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setHasSearched: (hasSearched) => set({ hasSearched }),
  clearSearch: () => set({ searchQuery: '', beaches: [], hasSearched: false }),
}));
