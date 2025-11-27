'use client';

import { Card } from '@/components/ui/card';
import { useBeachStore } from '@/stores/beach.store';
import { MapPin, Globe } from 'lucide-react';
import Link from 'next/link';

export function BeachList() {
  const { beaches, isLoading, error, hasSearched } = useBeachStore();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Buscando playas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (beaches.length === 0 && hasSearched) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No se encontraron playas. Intenta con otro término de búsqueda.
        </p>
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {beaches.map((beach, index) => (
        <Link key={index} href={`/beaches/${encodeURIComponent(beach.name)}`}>
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <h3 className="text-lg font-semibold mb-2">{beach.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <span>
                {beach.latitude.toFixed(4)}, {beach.longitude.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>Orientación: {beach.orientation}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
