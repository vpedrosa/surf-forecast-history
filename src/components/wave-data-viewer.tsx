'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Waves, Calendar, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeeklyWaveData } from '@/types/beach';

interface WaveDataViewerProps {
  buoyId: number;
  initialWeekData: WeeklyWaveData | null;
  maxWeekOffset: number;
}

function getDirectionLabel(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function WaveDataViewer({ buoyId, initialWeekData, maxWeekOffset }: WaveDataViewerProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData] = useState<WeeklyWaveData | null>(initialWeekData);
  const [isLoading, setIsLoading] = useState(false);

  const loadWeekData = async (offset: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wave-data?buoyId=${buoyId}&weekOffset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const weekData: WeeklyWaveData = {
          weekStart: new Date(data.weekStart),
          weekEnd: new Date(data.weekEnd),
          days: data.days.map((day: any) => ({
            date: new Date(day.date),
            height: day.height,
            period: day.period,
            direction: day.direction,
          })),
        };
        setWeekData(weekData);
        setWeekOffset(offset);
      }
    } catch (error) {
      console.error('Error loading week data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    if (weekOffset < maxWeekOffset) {
      loadWeekData(weekOffset + 1);
    }
  };

  const goToNextWeek = () => {
    if (weekOffset > 0) {
      loadWeekData(weekOffset - 1);
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
          disabled={isLoading || weekOffset >= maxWeekOffset}
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
          disabled={isLoading || weekOffset === 0}
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
