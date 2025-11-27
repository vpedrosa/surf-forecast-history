import { promises as fs } from 'fs';
import path from 'path';
import {
  Beach,
  WaveSourcePoint,
  WaveDataPoint,
  WeeklyWaveData,
  DailyWaveData,
} from '@/types/beach';

const DATA_DIR = path.join(process.cwd(), 'data');

// Cache para los datos
let beachesCache: Beach[] | null = null;
let waveSourcePointsCache: WaveSourcePoint[] | null = null;

export async function loadBeaches(): Promise<Beach[]> {
  if (beachesCache) {
    return beachesCache;
  }

  const filePath = path.join(DATA_DIR, 'beaches.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(fileContent);
  beachesCache = data.beaches;
  return beachesCache!;
}

export async function loadWaveSourcePoints(): Promise<WaveSourcePoint[]> {
  if (waveSourcePointsCache) {
    return waveSourcePointsCache;
  }

  const filePath = path.join(DATA_DIR, 'wave-source-points.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  waveSourcePointsCache = JSON.parse(fileContent);
  return waveSourcePointsCache!;
}

export async function loadWaveData(
  buoyId: number,
  type: 'height' | 'period' | 'direction'
): Promise<WaveDataPoint[]> {
  try {
    const filePath = path.join(DATA_DIR, `${buoyId}-${type}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading wave data for buoy ${buoyId}, type ${type}:`, error);
    return [];
  }
}

/**
 * Calcula la distancia haversine entre dos puntos geográficos
 * @param lat1 Latitud del punto 1
 * @param lon1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lon2 Longitud del punto 2
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Encuentra la boya más cercana a una ubicación dada
 */
export async function findNearestBuoy(
  latitude: number,
  longitude: number
): Promise<WaveSourcePoint | null> {
  const buoys = await loadWaveSourcePoints();

  if (buoys.length === 0) {
    return null;
  }

  let nearestBuoy = buoys[0];
  let minDistance = calculateDistance(
    latitude,
    longitude,
    buoys[0].latitud,
    buoys[0].longitud
  );

  for (let i = 1; i < buoys.length; i++) {
    const distance = calculateDistance(
      latitude,
      longitude,
      buoys[i].latitud,
      buoys[i].longitud
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestBuoy = buoys[i];
    }
  }

  return nearestBuoy;
}

/**
 * Obtiene el inicio de la semana para una fecha dada (lunes)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
  return new Date(d.setDate(diff));
}

/**
 * Obtiene el fin de la semana para una fecha dada (domingo)
 */
function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

/**
 * Obtiene datos de olas de una semana específica
 * @param buoyId ID de la boya
 * @param weekOffset Offset de semanas desde la semana actual (0 = semana actual, 1 = semana anterior, etc.)
 */
export async function getWeekWaveData(
  buoyId: number,
  weekOffset: number = 0
): Promise<WeeklyWaveData | null> {
  // Cargar los tres tipos de datos
  const [heightData, periodData, directionData] = await Promise.all([
    loadWaveData(buoyId, 'height'),
    loadWaveData(buoyId, 'period'),
    loadWaveData(buoyId, 'direction'),
  ]);

  if (heightData.length === 0) {
    return null;
  }

  // Crear mapas para acceso rápido por fecha
  const heightMap = new Map<string, string>();
  const periodMap = new Map<string, string>();
  const directionMap = new Map<string, string>();

  heightData.forEach((item) => {
    const date = new Date(item.fecha).toISOString().split('T')[0];
    heightMap.set(date, item['Datos horarios']);
  });

  periodData.forEach((item) => {
    const date = new Date(item.fecha).toISOString().split('T')[0];
    periodMap.set(date, item['Datos horarios']);
  });

  directionData.forEach((item) => {
    const date = new Date(item.fecha).toISOString().split('T')[0];
    directionMap.set(date, item['Datos horarios']);
  });

  // Calcular la semana objetivo
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() - (weekOffset * 7));
  const targetWeekStart = getWeekStart(targetDate);
  const targetWeekEnd = getWeekEnd(targetWeekStart);

  // Recopilar datos de la semana objetivo
  const weekDays: DailyWaveData[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(targetWeekStart);
    currentDay.setDate(targetWeekStart.getDate() + i);
    const dateStr = currentDay.toISOString().split('T')[0];

    const heightValue = heightMap.get(dateStr);
    const periodValue = periodMap.get(dateStr);
    const directionValue = directionMap.get(dateStr);

    weekDays.push({
      date: new Date(currentDay),
      height: heightValue ? parseFloat(heightValue) : null,
      period: periodValue ? parseFloat(periodValue) : null,
      direction: directionValue ? parseFloat(directionValue) : null,
    });
  }

  return {
    weekStart: targetWeekStart,
    weekEnd: targetWeekEnd,
    days: weekDays,
  };
}

/**
 * Obtiene el número total de semanas disponibles para una boya
 */
export async function getAvailableWeeksCount(buoyId: number): Promise<number> {
  const heightData = await loadWaveData(buoyId, 'height');

  if (heightData.length === 0) {
    return 0;
  }

  // Obtener la fecha más antigua y más reciente
  const dates = heightData.map(item => new Date(item.fecha));
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // Calcular diferencia en semanas
  const diffTime = Math.abs(newestDate.getTime() - oldestDate.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

  return diffWeeks;
}

/**
 * Obtiene el rango de fechas disponibles para una boya
 */
export async function getDataDateRange(buoyId: number): Promise<{ startDate: Date; endDate: Date } | null> {
  const heightData = await loadWaveData(buoyId, 'height');

  if (heightData.length === 0) {
    return null;
  }

  // Obtener la fecha más antigua y más reciente
  const dates = heightData.map(item => new Date(item.fecha));
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));

  return {
    startDate: oldestDate,
    endDate: newestDate,
  };
}

/**
 * Busca playas por nombre
 */
export async function searchBeaches(query: string): Promise<Beach[]> {
  const beaches = await loadBeaches();
  const lowerQuery = query.toLowerCase();

  return beaches.filter((beach) =>
    beach.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtiene una playa por su nombre exacto
 */
export async function getBeachByName(name: string): Promise<Beach | null> {
  const beaches = await loadBeaches();
  return beaches.find((beach) => beach.name === name) || null;
}
