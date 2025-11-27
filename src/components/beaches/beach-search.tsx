'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useBeachStore } from '@/stores/beach.store';

export function BeachSearch() {
  const [query, setQuery] = useState('');
  const { setBeaches, setIsLoading, setError, setHasSearched } = useBeachStore();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      setBeaches([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/beaches?query=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        throw new Error('Error al buscar playas');
      }

      const beaches = await response.json();
      setBeaches(beaches);
    } catch (error) {
      console.error('Error searching beaches:', error);
      setError('Error al buscar playas. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [setBeaches, setIsLoading, setError, setHasSearched]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <Card className="p-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar playa por nombre..."
          value={query}
          onChange={handleInputChange}
          className="w-full pl-10"
        />
      </div>
    </Card>
  );
}
