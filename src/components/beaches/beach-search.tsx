'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useBeachStore } from '@/stores/beach.store';
import { Beach } from '@/types/beach';

interface BeachSearchProps {
  allBeaches: Beach[];
}

export function BeachSearch({ allBeaches }: BeachSearchProps) {
  const [query, setQuery] = useState('');
  const { setBeaches, setIsLoading, setError, setHasSearched } = useBeachStore();

  const performSearch = useCallback((searchQuery: string) => {
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
      // Búsqueda local en el cliente
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = allBeaches.filter((beach) =>
        beach.name.toLowerCase().includes(lowerQuery)
      );
      setBeaches(filtered);
    } catch (error) {
      console.error('Error searching beaches:', error);
      setError('Error al buscar playas. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [allBeaches, setBeaches, setIsLoading, setError, setHasSearched]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); // Reducido a 300ms ya que es búsqueda local

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
