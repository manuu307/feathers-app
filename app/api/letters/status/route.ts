import { NextRequest, NextResponse } from 'next/server';
import { LetterService } from '@/lib/services/letterService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { id, status, tags } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      // Mock update
      return NextResponse.json({ _id: id, status, tags }, { status: 200 });
    }

    const updatedLetter = await LetterService.updateStatus(id, status, tags);

    if (!updatedLetter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLetter, { status: 200 });
  } catch (error) {
    console.error('Error updating letter status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
