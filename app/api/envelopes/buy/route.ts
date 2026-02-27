import { NextRequest, NextResponse } from 'next/server';
import { EnvelopeService } from '@/lib/services/envelopeService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, envelopeId } = await req.json();

    if (!userId || !envelopeId) {
      return NextResponse.json({ error: 'User ID and Envelope ID are required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const result = await EnvelopeService.buyEnvelope(userId, envelopeId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error buying envelope:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
