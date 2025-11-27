import { getBeachByName, findNearestBuoy, loadWaveData, getDataDateRange } from '@/lib/data-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { MapPin, ArrowLeft, Compass, Home, Anchor, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BeachMapWrapper } from '@/components/beach-map-wrapper';
import { BuoyMapWrapper } from '@/components/buoy-map-wrapper';
import { WaveDataViewer } from '@/components/wave-data-viewer';
import Image from 'next/image';

interface BeachPageProps {
  params: Promise<{ id: string }>;
}

export default async function BeachPage({ params }: BeachPageProps) {
  const { id } = await params;
  const beachName = decodeURIComponent(id);

  const beach = await getBeachByName(beachName);

  if (!beach) {
    notFound();
  }

  // Encontrar la boya más cercana
  const nearestBuoy = await findNearestBuoy(beach.latitude, beach.longitude);

  // Cargar TODOS los datos de olas de una vez
  let allWaveData = null;
  let dateRange = null;

  if (nearestBuoy) {
    const [heightData, periodData, directionData, range] = await Promise.all([
      loadWaveData(nearestBuoy.id, 'height'),
      loadWaveData(nearestBuoy.id, 'period'),
      loadWaveData(nearestBuoy.id, 'direction'),
      getDataDateRange(nearestBuoy.id),
    ]);

    allWaveData = {
      height: heightData,
      period: periodData,
      direction: directionData,
    };

    dateRange = range;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link href="/">
                  <Image
                    src="/logo.png"
                    alt="Swell History Logo"
                    width={40}
                    height={40}
                    className="object-contain cursor-pointer"
                  />
                </Link>
                <Link href="/beaches">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold">{beach.name}</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Información de la playa */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información de la playa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Coordenadas</p>
                  <p className="font-medium">
                    {beach.latitude.toFixed(4)}, {beach.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Orientación</p>
                  <p className="font-medium">{beach.orientation}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Mapa */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
            <BeachMapWrapper latitude={beach.latitude} longitude={beach.longitude} name={beach.name} />
          </Card>

          {/* Información de la boya con mapa */}
          {nearestBuoy && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Anchor className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Boya de Referencia</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información de la boya */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{nearestBuoy.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-medium">{nearestBuoy.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Sensor</p>
                    <p className="font-medium">{nearestBuoy.tipoSensor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profundidad</p>
                    <p className="font-medium">{nearestBuoy.altitudProfundidad}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coordenadas</p>
                    <p className="font-medium">
                      {nearestBuoy.latitud.toFixed(4)}, {nearestBuoy.longitud.toFixed(4)}
                    </p>
                  </div>
                </div>
                {/* Mapa de la boya */}
                <div>
                  <BuoyMapWrapper
                    latitude={nearestBuoy.latitud}
                    longitude={nearestBuoy.longitud}
                    name={nearestBuoy.nombre}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Datos semanales de olas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Condiciones de Olas</h2>
              {dateRange && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Datos disponibles desde{' '}
                    <strong className="text-foreground">
                      {dateRange.startDate.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                    {' '}hasta{' '}
                    <strong className="text-foreground">
                      {dateRange.endDate.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </div>
            {nearestBuoy && allWaveData ? (
              <WaveDataViewer
                allWaveData={allWaveData}
              />
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  No hay datos de olas disponibles para esta playa.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
