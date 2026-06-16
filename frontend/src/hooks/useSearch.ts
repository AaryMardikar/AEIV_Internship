import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface SearchItem {
  id: string;
  title: string;
  description: string | null;
  type: 'task' | 'approval' | 'meeting' | 'document' | 'notification';
  created_at: string;
  status?: string;
  priority?: string;
  category?: string;
  read_status?: boolean;
  meeting_date?: string;
  participants?: string[];
  file_type?: string;
  file_size?: number;
}

export interface SearchResults {
  tasks: SearchItem[];
  approvals: SearchItem[];
  meetings: SearchItem[];
  documents: SearchItem[];
  notifications: SearchItem[];
}

const HISTORY_KEY = 'owh_search_history';

/**
 * Fetch search history from localStorage
 */
export const getSearchHistory = (): string[] => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to parse search history', error);
    return [];
  }
};

/**
 * Add a term to search history in localStorage
 */
export const addSearchHistoryTerm = (term: string): void => {
  const cleanTerm = term.trim();
  if (!cleanTerm) return;
  try {
    const history = getSearchHistory();
    const filteredHistory = history.filter(item => item.toLowerCase() !== cleanTerm.toLowerCase());
    const newHistory = [cleanTerm, ...filteredHistory].slice(0, 8); // limit to 8 entries
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save search term to history', error);
  }
};

/**
 * Clear the search history in localStorage
 */
export const clearSearchHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

/**
 * Query hook for global search API
 */
export const useSearch = (q: string, type: string = 'all') => {
  return useQuery({
    queryKey: ['search', { q, type }],
    queryFn: async () => {
      const cleanQ = q.trim();
      if (!cleanQ) {
        return {
          tasks: [],
          approvals: [],
          meetings: [],
          documents: [],
          notifications: [],
        } as SearchResults;
      }

      const { data } = await apiClient.get<{ data: { results: SearchResults } }>(
        ENDPOINTS.search.query,
        {
          params: { q: cleanQ, type },
        }
      );
      return data.data.results;
    },
    enabled: q.trim().length > 0,
    staleTime: 5000,
  });
};
