import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface WaveStation {
  id: number;
  nombre: string;
  boya: boolean;
  disponible: boolean;
}

interface WaveDataPoint {
  fecha: string;
  'Datos horarios': string;
}

interface WaveDataResponse {
  datos: WaveDataPoint[];
}

const WAVE_SOURCES_FILE = join(__dirname, 'wave-source-points.json');
const API_BASE_URL = 'https://portus.puertos.es/portussvr/api/historicosSerialTime/estacion/WAVE';
const DELAY_BETWEEN_REQUESTS = 1000; // 1 segundo

// Calcular fechas: últimos 12 años
const hasta = new Date();
const desde = new Date();
desde.setFullYear(hasta.getFullYear() - 12);

const DESDE = desde.toISOString();
const HASTA = hasta.toISOString();

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWaveDataForStation(stationId: number): Promise<WaveDataPoint[]> {
  const url = `${API_BASE_URL}/${stationId}?locale=es`;

  const payload = {
    graficos: [
      {
        text: 'Datos horarios',
        grafico: 'DATOS',
        parametro: 'hm0',
        limiteDatos: 10
      }
    ],
    desde: DESDE,
    hasta: HASTA,
    variable: 'WAVE'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
  }

  const data: WaveDataResponse = await response.json();
  return data.datos || [];
}

async function fetchAllWaveData() {
  try {
    // Leer las estaciones del archivo
    console.log('📖 Leyendo estaciones desde wave-source-points.json...\n');
    const stationsData = readFileSync(WAVE_SOURCES_FILE, 'utf-8');
    const stations: WaveStation[] = JSON.parse(stationsData);

    console.log(`📊 Total de estaciones encontradas: ${stations.length}`);
    console.log(`📅 Rango de fechas: ${DESDE.split('T')[0]} a ${HASTA.split('T')[0]}\n`);
    console.log('🌊 Iniciando descarga de datos históricos...\n');
    console.log('='.repeat(70));

    let totalDataPoints = 0;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      const progress = `[${i + 1}/${stations.length}]`;

      try {
        console.log(`\n${progress} 🎯 Boya ID: ${station.id} - ${station.nombre}`);
        console.log(`         ⏳ Descargando datos...`);

        const waveData = await fetchWaveDataForStation(station.id);
        const dataCount = waveData.length;
        totalDataPoints += dataCount;

        // Guardar datos en archivo
        const outputFile = join(__dirname, `${station.id}-height.json`);
        writeFileSync(outputFile, JSON.stringify(waveData, null, 2), 'utf-8');

        console.log(`         ✅ Datos obtenidos: ${dataCount} puntos`);
        console.log(`         💾 Guardado en: ${station.id}-height.json`);

        successCount++;

        // Esperar 1 segundo antes de la siguiente petición (excepto en la última)
        if (i < stations.length - 1) {
          console.log(`         ⏸️  Esperando 1 segundo...`);
          await sleep(DELAY_BETWEEN_REQUESTS);
        }

      } catch (error) {
        errorCount++;
        console.log(`         ❌ Error al obtener datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('\n📈 RESUMEN FINAL:');
    console.log(`   ✅ Boyas procesadas correctamente: ${successCount}`);
    console.log(`   ❌ Boyas con errores: ${errorCount}`);
    console.log(`   📊 Total de puntos de datos descargados: ${totalDataPoints.toLocaleString()}`);
    console.log(`   📁 Archivos generados: ${successCount}`);
    console.log('\n✨ Proceso completado!\n');

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar el script
fetchAllWaveData();
