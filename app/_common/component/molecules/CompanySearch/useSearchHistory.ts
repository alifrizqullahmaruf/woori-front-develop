import { useCallback, useEffect, useState } from "react";
import type { SearchHistoryItem } from "./types";

export function useSearchHistory(storageKey: string, maxItems = 5) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as SearchHistoryItem[];
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, maxItems));
        }
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey, maxItems]);

  const persist = useCallback(
    (items: SearchHistoryItem[]) => {
      setHistory(items);
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (error) {
        console.warn("Failed to save search history:", error);
      }
    },
    [storageKey]
  );

  const addHistory = useCallback(
    (item: SearchHistoryItem) => {
      const filtered = history.filter((h) => h.ticker !== item.ticker);
      const newHistory = [item, ...filtered].slice(0, maxItems);
      persist(newHistory);
    },
    [history, maxItems, persist]
  );

  const removeFromHistory = useCallback(
    (ticker: string) => {
      persist(history.filter((h) => h.ticker !== ticker));
    },
    [history, persist]
  );

  const clearHistory = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    history,
    isLoaded,
    addHistory,
    removeFromHistory,
    clearHistory,
  };
}