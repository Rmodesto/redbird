import { NextResponse } from 'next/server';
import lineStationsData from '@/data/line-stations-extracted.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(lineStationsData);
  } catch (error) {
    console.error('Error loading line stations data:', error);
    return NextResponse.json(
      { error: 'Failed to load line stations data' },
      { status: 500 }
    );
  }
}