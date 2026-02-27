import { NextRequest, NextResponse } from 'next/server';
import { LetterService } from '@/lib/services/letterService';
import { MOCK_LETTERS } from '@/lib/mocks';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || address === 'undefined') {
      return NextResponse.json({ error: 'Valid address is required' }, { status: 400 });
    }

    // Check for demo/mock mode
    if (!process.env.MONGODB_URI || address === 'elder-thorne') {
      console.log(`Using mock letters for address: ${address} (DB missing or demo address)`);
      const { searchParams } = new URL(req.url);
      const type = searchParams.get('type');
      
      let filteredMocks = MOCK_LETTERS;
      if (type === 'saved') {
        filteredMocks = MOCK_LETTERS.filter((l: any) => l.status === 'saved');
      } else if (type === 'sent') {
        // Return empty or some mock sent letters
        filteredMocks = []; 
      } else {
        filteredMocks = MOCK_LETTERS.filter((l: any) => !l.status || l.status === 'received' || l.status === 'sending');
      }
      return NextResponse.json(filteredMocks, { status: 200 });
    }
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    let letters;
    if (type === 'saved') {
      letters = await LetterService.getSavedLetters(address);
    } else if (type === 'sent') {
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required for sent letters' }, { status: 400 });
      }
      letters = await LetterService.getSentLetters(userId);
    } else {
      letters = await LetterService.getIncomingLetters(address);
    }
    
    return NextResponse.json(letters || [], { status: 200 });
  } catch (error: any) {
    console.error('Error fetching letters:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 });
  }
}
