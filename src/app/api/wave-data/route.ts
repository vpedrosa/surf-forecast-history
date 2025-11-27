import { NextRequest, NextResponse } from 'next/server';
import { getWeekWaveData } from '@/lib/data-loader';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const buoyId = searchParams.get('buoyId');
    const weekOffset = searchParams.get('weekOffset');

    if (!buoyId) {
      return NextResponse.json(
        { error: 'buoyId parameter is required' },
        { status: 400 }
      );
    }

    const offset = weekOffset ? parseInt(weekOffset, 10) : 0;
    const weekData = await getWeekWaveData(parseInt(buoyId, 10), offset);

    return NextResponse.json(weekData);
  } catch (error) {
    console.error('Error in wave-data API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
