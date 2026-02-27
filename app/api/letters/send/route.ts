import { NextRequest, NextResponse } from 'next/server';
import { LetterService } from '@/lib/services/letterService';
import { SendLetterSchema } from '@/lib/validation';
import { ZodError } from 'zod';
import { MOCK_STAMPS } from '@/lib/mocks';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check for demo/mock mode
    if (!process.env.MONGODB_URI || body.sender_address === 'elder-thorne') {
      console.log('Simulating letter send (DB missing or demo address)');
      
      const stamp = body.stamp_id ? MOCK_STAMPS.find(s => s.id === body.stamp_id) : null;
      
      return NextResponse.json({ 
        _id: 'mock-sent-' + Date.now(),
        ...body,
        stamp,
        available_at: new Date(Date.now() + 120000).toISOString(),
        created_at: new Date().toISOString()
      }, { status: 201 });
    }
    
    // Validate input
    const validatedData = SendLetterSchema.parse(body);
    
    const newLetter = await LetterService.sendLetter(validatedData);
    
    return NextResponse.json(newLetter, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    if (error.message.includes('Sender not found') || error.message.includes('Recipient address does not exist')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message.includes('wait before writing')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error('Error sending letter:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
