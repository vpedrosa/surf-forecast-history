import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

interface Beach {
  name: string;
  latitude?: number;
  longitude?: number;
  orientation?: string;
}

interface BeachesData {
  beaches: Beach[];
}

const BEACHES_FILE = join(__dirname, 'beaches.json');

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function extractCoordinatesFromGoogleMapsUrl(url: string): { latitude: number; longitude: number } | null {
  // Extraer coordenadas del formato: /@latitud,longitud,zoom
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),/;
  const match = url.match(regex);

  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2])
    };
  }

  return null;
}

async function addBeachCoordinates() {
  try {
    // Leer el archivo de playas
    console.log('📖 Leyendo beaches.json...\n');
    const beachesData = readFileSync(BEACHES_FILE, 'utf-8');
    const data: BeachesData = JSON.parse(beachesData);

    console.log(`📊 Total de playas: ${data.beaches.length}\n`);
    console.log('📍 Pega el enlace de Google Maps para cada playa');
    console.log('   Ejemplo: https://www.google.es/maps/place/.../@36.1862287,-5.9293141,15z/...');
    console.log('🧭 Orientaciones comunes: N, NE, E, SE, S, SW, W, NW');
    console.log('   También puedes usar rangos como: N-NE, SW-W, etc.\n');
    console.log('='.repeat(70));

    const rl = createReadlineInterface();
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let completeCount = 0;

    for (let i = 0; i < data.beaches.length; i++) {
      const beach = data.beaches[i];
      const progress = `[${i + 1}/${data.beaches.length}]`;

      // Si ya tiene todos los datos, saltarla
      if (beach.latitude && beach.longitude && beach.orientation) {
        console.log(`\n${progress} ✅ ${beach.name} - Datos completos (saltando)`);
        completeCount++;
        continue;
      }

      console.log(`\n${progress} 🏖️  Playa: ${beach.name}`);

      // Si ya tiene coordenadas, mostrarlas
      if (beach.latitude && beach.longitude) {
        console.log(`   ℹ️  Coordenadas actuales: ${beach.latitude}, ${beach.longitude}`);
        if (beach.orientation) {
          console.log(`   ℹ️  Orientación actual: ${beach.orientation}`);
        }
        const update = await askQuestion(
          rl,
          '   ¿Actualizar? (Enter para mantener, o pega nuevo enlace): '
        );

        if (update) {
          const coords = extractCoordinatesFromGoogleMapsUrl(update);
          if (coords) {
            beach.latitude = coords.latitude;
            beach.longitude = coords.longitude;
            console.log(`   ✅ Coordenadas actualizadas: ${coords.latitude}, ${coords.longitude}`);

            // Pedir orientación
            const orientation = await askQuestion(
              rl,
              '   🧭 Introduce la orientación de la playa: '
            );
            if (orientation) {
              beach.orientation = orientation;
              console.log(`   ✅ Orientación actualizada: ${orientation}`);
            }

            updatedCount++;
          } else {
            console.log(`   ❌ No se pudieron extraer coordenadas del enlace`);
            errorCount++;
          }
        } else {
          console.log(`   ⏭️  Datos mantenidos`);
          skippedCount++;
        }
      } else {
        const mapsUrl = await askQuestion(
          rl,
          '   📍 Pega el enlace de Google Maps: '
        );

        if (mapsUrl) {
          const coords = extractCoordinatesFromGoogleMapsUrl(mapsUrl);
          if (coords) {
            beach.latitude = coords.latitude;
            beach.longitude = coords.longitude;
            console.log(`   ✅ Coordenadas añadidas: ${coords.latitude}, ${coords.longitude}`);

            // Pedir orientación
            const orientation = await askQuestion(
              rl,
              '   🧭 Introduce la orientación de la playa: '
            );
            if (orientation) {
              beach.orientation = orientation;
              console.log(`   ✅ Orientación añadida: ${orientation}`);
            }

            updatedCount++;
          } else {
            console.log(`   ❌ No se pudieron extraer coordenadas del enlace`);
            errorCount++;
          }
        } else {
          console.log(`   ⚠️  Sin datos añadidos`);
          skippedCount++;
        }
      }
    }

    rl.close();

    // Guardar el archivo actualizado
    console.log('\n' + '='.repeat(70));
    console.log('\n💾 Guardando cambios...');
    writeFileSync(BEACHES_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // Resumen final
    console.log('\n📈 RESUMEN:');
    console.log(`   ✅ Playas actualizadas: ${updatedCount}`);
    console.log(`   ✓  Playas ya completas (saltadas): ${completeCount}`);
    console.log(`   ⏭️  Playas sin cambios: ${skippedCount}`);
    console.log(`   ❌ Errores al extraer coordenadas: ${errorCount}`);
    console.log(`   📁 Archivo guardado: beaches.json`);
    console.log('\n✨ Proceso completado!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar el script
addBeachCoordinates();
