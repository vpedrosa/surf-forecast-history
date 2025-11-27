import { writeFileSync } from 'fs';
import { join } from 'path';

interface WaveStation {
  longitud: number;
  latitud: number;
  id: number;
  minZoom: number;
  maxZoom: number;
  estado: number;
  redId: number;
  red: {
    id: number;
    locale: string;
    nombre: string;
    descripcion: string;
    tipoRed: string;
  };
  nombre: string;
  tipoSensor: string;
  modeloEstacion: string;
  altitudProfundidad: number;
  fechaAlta: string;
  fechaFin: string | null;
  cadencia: number;
  comentarios: string | null;
  ubicacion: string | null;
  incidencia: string | null;
  propietario: number;
  urlPropietario: string;
  locale: string;
  boya: boolean;
  mareografo: boolean;
  meteorologica: boolean;
  radar: boolean;
  disponible: boolean;
  maxFechaAna: string | null;
  adcp: any;
}

const API_URL = 'https://portus.puertos.es/portussvr/api/estaciones/hist/WAVE?locale=es';
const OUTPUT_FILE = join(__dirname, 'wave-source-points.json');

async function fetchWaveStations() {
  try {
    console.log('🌊 Obteniendo datos de las estaciones...');
    console.log(`URL: ${API_URL}\n`);

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const data: WaveStation[] = await response.json();

    // Guardar los datos en el archivo JSON
    writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // Mostrar estadísticas
    console.log('✅ Datos obtenidos correctamente');
    console.log(`📊 Número total de estaciones: ${data.length}`);
    console.log(`🎯 Número de boyas: ${data.filter(station => station.boya).length}`);
    console.log(`📍 Archivo guardado en: ${OUTPUT_FILE}\n`);

    // Mostrar algunas estadísticas adicionales
    const disponibles = data.filter(station => station.disponible).length;
    const activas = data.filter(station => station.boya && station.disponible).length;

    console.log('📈 Estadísticas adicionales:');
    console.log(`   - Estaciones disponibles: ${disponibles}`);
    console.log(`   - Boyas activas: ${activas}`);
    console.log(`   - Mareógrafos: ${data.filter(station => station.mareografo).length}`);
    console.log(`   - Meteorológicas: ${data.filter(station => station.meteorologica).length}`);

  } catch (error) {
    console.error('❌ Error al obtener los datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
fetchWaveStations();
