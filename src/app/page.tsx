import { BeachSearch } from '@/components/beaches/beach-search';
import { BeachList } from '@/components/beaches/beach-list';
import { Footer } from '@/components/footer';
import { loadBeaches } from '@/lib/data-loader';
import Link from 'next/link';
import { List } from 'lucide-react';
import Image from 'next/image';

export default async function Home() {
  // Cargar todas las playas en el servidor
  const allBeaches = await loadBeaches();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto py-8 px-4 flex-1 flex items-center">
        <div className="max-w-4xl mx-auto space-y-8 w-full">
          {/* Logo centrado */}
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Swell History Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Título y descripción */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Swell History</h1>
            <h2 className="text-2xl font-semibold">
              Busca el historial de condiciones de surf
            </h2>
            <p className="text-muted-foreground">
              Consulta datos históricos de olas, viento y mareas de tus playas favoritas
            </p>
          </div>

          {/* Buscador */}
          <BeachSearch allBeaches={allBeaches} />

          {/* Resultados */}
          <div className="mt-8">
            <BeachList />
          </div>

          {/* Link a todas las playas */}
          <div className="text-center">
            <Link
              href="/beaches"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <List className="h-4 w-4" />
              Quiero ver todas las playas
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
