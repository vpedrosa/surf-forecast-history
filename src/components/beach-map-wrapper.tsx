'use client';

import dynamic from 'next/dynamic';

const BeachMap = dynamic(() => import('@/components/beach-map').then(mod => ({ default: mod.BeachMap })), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg border flex items-center justify-center bg-muted">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
});

interface BeachMapWrapperProps {
  latitude: number;
  longitude: number;
  name: string;
}

export function BeachMapWrapper({ latitude, longitude, name }: BeachMapWrapperProps) {
  return <BeachMap latitude={latitude} longitude={longitude} name={name} />;
}
