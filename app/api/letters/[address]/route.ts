import { NextRequest, NextResponse } from 'next/server';
import { LetterService } from '@/lib/services/letterService';
import { MOCK_LETTERS } from '@/lib/mocks';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Check for demo/mock mode
    if (!process.env.MONGODB_URI || address === 'elder-thorne') {
      console.log('Using mock letters (DB missing or demo address)');
      const { searchParams } = new URL(req.url);
      const type = searchParams.get('type');
      
      let filteredMocks = MOCK_LETTERS;
      if (type === 'saved') {
        filteredMocks = MOCK_LETTERS.filter((l: any) => l.status === 'saved');
      } else {
        filteredMocks = MOCK_LETTERS.filter((l: any) => !l.status || l.status === 'received' || l.status === 'sending');
      }
      return NextResponse.json(filteredMocks, { status: 200 });
    }
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    let letters;
    if (type === 'saved') {
      letters = await LetterService.getSavedLetters(address);
    } else {
      letters = await LetterService.getIncomingLetters(address);
    }
    
    return NextResponse.json(letters, { status: 200 });
  } catch (error) {
    console.error('Error fetching letters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
