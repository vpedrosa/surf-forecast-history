import { NextRequest, NextResponse } from 'next/server';
import { searchBeaches, loadBeaches } from '@/lib/data-loader';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (query) {
      const beaches = await searchBeaches(query);
      return NextResponse.json(beaches);
    }

    const beaches = await loadBeaches();
    return NextResponse.json(beaches);
  } catch (error) {
    console.error('Error fetching beaches:', error);
    return NextResponse.json(
      { error: 'Error al obtener las playas' },
      { status: 500 }
    );
  }
}
