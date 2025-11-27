'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Waves, Calendar, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeeklyWaveData, WaveDataPoint } from '@/types/beach';

interface WaveDataViewerProps {
  allWaveData: {
    height: WaveDataPoint[];
    period: WaveDataPoint[];
    direction: WaveDataPoint[];
  };
}

function getDirectionLabel(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Función auxiliar para obtener el inicio de semana
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Función auxiliar para obtener el fin de semana
function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function WaveDataViewer({ allWaveData }: WaveDataViewerProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Procesar todos los datos en el cliente para obtener el máximo de semanas y los datos de la semana actual
  const { maxWeekOffset, weekData } = useMemo(() => {
    const { height, period, direction } = allWaveData;

    if (height.length === 0) {
      return { maxWeekOffset: 0, weekData: null };
    }

    // Crear mapas para acceso rápido
    const heightMap = new Map<string, string>();
    const periodMap = new Map<string, string>();
    const directionMap = new Map<string, string>();

    height.forEach((item) => {
      const date = new Date(item.fecha).toISOString().split('T')[0];
      heightMap.set(date, item['Datos horarios']);
    });

    period.forEach((item) => {
      const date = new Date(item.fecha).toISOString().split('T')[0];
      periodMap.set(date, item['Datos horarios']);
    });

    direction.forEach((item) => {
      const date = new Date(item.fecha).toISOString().split('T')[0];
      directionMap.set(date, item['Datos horarios']);
    });

    // Calcular máximo de semanas
    const dates = height.map(item => new Date(item.fecha));
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const diffTime = Math.abs(newestDate.getTime() - oldestDate.getTime());
    const maxWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

    // Calcular datos de la semana actual basado en offset
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - (weekOffset * 7));
    const targetWeekStart = getWeekStart(targetDate);
    const targetWeekEnd = getWeekEnd(targetWeekStart);

    const weekDays = [];
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

    const currentWeekData: WeeklyWaveData = {
      weekStart: targetWeekStart,
      weekEnd: targetWeekEnd,
      days: weekDays,
    };

    return { maxWeekOffset: maxWeeks, weekData: currentWeekData };
  }, [allWaveData, weekOffset]);

  const goToPreviousWeek = () => {
    if (weekOffset < maxWeekOffset - 1) {
      setWeekOffset(weekOffset + 1);
    }
  };

  const goToNextWeek = () => {
    if (weekOffset > 0) {
      setWeekOffset(weekOffset - 1);
    }
  };

  if (!weekData) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">
          No hay datos de olas disponibles.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navegación de semanas */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          disabled={weekOffset >= maxWeekOffset - 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Semana anterior
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {weekOffset === 0 ? 'Semana actual' : `Hace ${weekOffset} semana${weekOffset > 1 ? 's' : ''}`}
          </p>
          <p className="font-semibold">
            {weekData.weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} -{' '}
            {weekData.weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          disabled={weekOffset === 0}
        >
          Semana siguiente
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Datos de la semana */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {weekData.days.map((day, dayIndex) => (
            <Card key={dayIndex} className="p-4 bg-muted/50">
              <p className="font-semibold mb-3 text-center">
                {day.date.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-blue-500" />
                    <span>Altura:</span>
                  </div>
                  <span className="font-medium">
                    {day.height !== null ? `${day.height.toFixed(2)}m` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span>Período:</span>
                  </div>
                  <span className="font-medium">
                    {day.period !== null ? `${day.period.toFixed(1)}s` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-orange-500" />
                    <span>Dirección:</span>
                  </div>
                  <span className="font-medium">
                    {day.direction !== null
                      ? `${day.direction.toFixed(0)}° ${getDirectionLabel(day.direction)}`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
