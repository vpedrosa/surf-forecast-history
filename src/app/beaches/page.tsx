import { loadBeaches } from '@/lib/data-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { MapPin, Compass, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function BeachesPage() {
  const beaches = await loadBeaches();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Swell History Logo"
                  width={50}
                  height={50}
                  className="object-contain cursor-pointer"
                />
              </Link>
              <h1 className="text-3xl font-bold">Todas las Playas</h1>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 flex-1">
        {beaches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No hay playas registradas aún.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <Compass className="h-4 w-4" />
                    <span>Orientación: {beach.orientation}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
