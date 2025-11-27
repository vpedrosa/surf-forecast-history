import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';
import 'dotenv/config';

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
const DELAY_BETWEEN_REQUESTS = 1500; // 1.5 segundos para no exceder límites de API

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

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchPlaceOnGoogleMaps(placeName: string, apiKey: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Usar la API de Google Maps Geocoding
    const encodedPlace = encodeURIComponent(placeName);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedPlace}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }

    return null;
  } catch (error) {
    console.error(`   ❌ Error en la búsqueda: ${error}`);
    return null;
  }
}

async function autoFetchCoordinates() {
  try {
    const rl = createReadlineInterface();

    // Intentar leer API key del .env
    let apiKey = process.env.GOOGLE_MAPS_API_KEY || '';

    if (!apiKey) {
      // Si no está en .env, pedirla interactivamente
      console.log('🔑 Para usar este script necesitas una API key de Google Maps');
      console.log('   Puedes obtenerla en: https://developers.google.com/maps/documentation/geocoding/get-api-key');
      console.log('   💡 Tip: Guárdala en el archivo .env como GOOGLE_MAPS_API_KEY para no tener que introducirla cada vez\n');

      apiKey = await askQuestion(rl, '🔑 Introduce tu Google Maps API Key: ');

      if (!apiKey) {
        console.log('❌ API Key requerida. Saliendo...');
        rl.close();
        process.exit(1);
      }
    } else {
      console.log('🔑 API Key cargada desde .env\n');
    }

    console.log('\n📖 Leyendo beaches.json...\n');
    const beachesData = readFileSync(BEACHES_FILE, 'utf-8');
    const data: BeachesData = JSON.parse(beachesData);

    console.log(`📊 Total de playas: ${data.beaches.length}`);
    console.log('🧭 Orientaciones comunes: N, NE, E, SE, S, SW, W, NW\n');
    console.log('='.repeat(70));

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

      // Si no tiene coordenadas, buscarlas automáticamente
      if (!beach.latitude || !beach.longitude) {
        console.log(`   🔍 Buscando coordenadas automáticamente...`);

        const coords = await searchPlaceOnGoogleMaps(beach.name + ' playa', apiKey);

        if (coords) {
          const mapsLink = `https://www.google.com/maps/@${coords.latitude},${coords.longitude},15z`;
          console.log(`   ✅ Coordenadas encontradas: ${coords.latitude}, ${coords.longitude}`);
          console.log(`   🔗 Enlace: ${mapsLink}`);

          // Confirmar con el usuario
          const confirm = await askQuestion(
            rl,
            '   ¿Son correctas estas coordenadas? (s/n o pega enlace de Google Maps si son incorrectas): '
          );

          if (confirm.toLowerCase() === 's' || confirm.toLowerCase() === 'si') {
            beach.latitude = coords.latitude;
            beach.longitude = coords.longitude;
            console.log(`   ✅ Coordenadas guardadas`);
          } else if (confirm.includes('google.com/maps') || confirm.includes('@')) {
            // Extraer del enlace
            const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),/;
            const match = confirm.match(regex);
            if (match) {
              beach.latitude = parseFloat(match[1]);
              beach.longitude = parseFloat(match[2]);
              console.log(`   ✅ Coordenadas corregidas: ${beach.latitude}, ${beach.longitude}`);
            }
          } else {
            console.log(`   ⏭️  Coordenadas rechazadas, saltando...`);
            skippedCount++;
            continue;
          }
        } else {
          console.log(`   ❌ No se encontraron coordenadas automáticamente`);
          const manual = await askQuestion(
            rl,
            '   📍 Pega el enlace de Google Maps (o Enter para saltar): '
          );

          if (manual) {
            const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),/;
            const match = manual.match(regex);
            if (match) {
              beach.latitude = parseFloat(match[1]);
              beach.longitude = parseFloat(match[2]);
              console.log(`   ✅ Coordenadas añadidas: ${beach.latitude}, ${beach.longitude}`);
            } else {
              console.log(`   ❌ No se pudieron extraer coordenadas`);
              errorCount++;
              continue;
            }
          } else {
            skippedCount++;
            continue;
          }
        }
      } else {
        console.log(`   ℹ️  Coordenadas ya establecidas: ${beach.latitude}, ${beach.longitude}`);
      }

      // Pedir orientación si no la tiene
      if (!beach.orientation) {
        const orientation = await askQuestion(
          rl,
          '   🧭 Introduce la orientación de la playa (o Enter para saltar): '
        );

        if (orientation) {
          beach.orientation = orientation;
          console.log(`   ✅ Orientación añadida: ${orientation}`);
        }
      }

      updatedCount++;

      // Esperar entre peticiones para no exceder límites de API
      if (i < data.beaches.length - 1) {
        await sleep(DELAY_BETWEEN_REQUESTS);
      }

      // Guardar progreso cada 10 playas
      if ((i + 1) % 10 === 0) {
        console.log(`\n   💾 Guardando progreso...`);
        writeFileSync(BEACHES_FILE, JSON.stringify(data, null, 2), 'utf-8');
      }
    }

    rl.close();

    // Guardar el archivo actualizado
    console.log('\n' + '='.repeat(70));
    console.log('\n💾 Guardando cambios finales...');
    writeFileSync(BEACHES_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // Resumen final
    console.log('\n📈 RESUMEN:');
    console.log(`   ✅ Playas actualizadas: ${updatedCount}`);
    console.log(`   ✓  Playas ya completas (saltadas): ${completeCount}`);
    console.log(`   ⏭️  Playas sin cambios: ${skippedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📁 Archivo guardado: beaches.json`);
    console.log('\n✨ Proceso completado!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar el script
autoFetchCoordinates();
