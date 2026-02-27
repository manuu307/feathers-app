import { NextRequest, NextResponse } from 'next/server';
import { EnvelopeService } from '@/lib/services/envelopeService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json([], { status: 200 });
    }
    
    await EnvelopeService.seedDefaultEnvelopes();
    const envelopes = await EnvelopeService.getAllEnvelopes();
    return NextResponse.json(envelopes, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching envelopes:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
