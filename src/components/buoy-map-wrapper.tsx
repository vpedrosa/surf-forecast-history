'use client';

import dynamic from 'next/dynamic';

const BuoyMap = dynamic(() => import('@/components/buoy-map').then(mod => ({ default: mod.BuoyMap })), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-lg border flex items-center justify-center bg-muted">
      <p className="text-muted-foreground">Cargando mapa de la boya...</p>
    </div>
  ),
});

interface BuoyMapWrapperProps {
  latitude: number;
  longitude: number;
  name: string;
}

export function BuoyMapWrapper({ latitude, longitude, name }: BuoyMapWrapperProps) {
  return <BuoyMap latitude={latitude} longitude={longitude} name={name} />;
}
