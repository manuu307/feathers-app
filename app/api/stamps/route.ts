import { NextRequest, NextResponse } from 'next/server';
import { StampService } from '@/lib/services/stampService';
import { MOCK_STAMPS } from '@/lib/mocks';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(MOCK_STAMPS, { status: 200 });
    }
    
    await StampService.seedDefaultStamps();
    const stamps = await StampService.getAllStamps();
    return NextResponse.json(stamps, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching stamps:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
