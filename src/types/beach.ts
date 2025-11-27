export interface Beach {
  name: string;
  latitude: number;
  longitude: number;
  orientation: string;
}

export interface WaveSourcePoint {
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
  incidencia: string;
  propietario: number;
  urlPropietario: string;
  locale: string;
  boya: boolean;
  mareografo: boolean;
  meteorologica: boolean;
  radar: boolean;
  disponible: boolean;
  maxFechaAna: string;
  adcp: string | null;
}

export interface WaveDataPoint {
  fecha: string;
  'Datos horarios': string;
}

export interface WeeklyWaveData {
  weekStart: Date;
  weekEnd: Date;
  days: DailyWaveData[];
}

export interface DailyWaveData {
  date: Date;
  height: number | null;
  period: number | null;
  direction: number | null;
}

export interface BeachWithWaveData extends Beach {
  nearestBuoy: WaveSourcePoint;
  weeklyData: WeeklyWaveData[];
}
