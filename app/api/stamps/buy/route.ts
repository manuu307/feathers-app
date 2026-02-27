import { NextRequest, NextResponse } from 'next/server';
import { StampService } from '@/lib/services/stampService';
import { MOCK_STAMPS, MOCK_USER } from '@/lib/mocks';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, stampId, quantity } = await req.json();

    if (!userId || !stampId) {
      return NextResponse.json({ error: 'User ID and Stamp ID are required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI || userId.startsWith('mock-')) {
      // Mock buy logic
      const stamp = MOCK_STAMPS.find(s => s.id === stampId);
      if (!stamp) return NextResponse.json({ error: 'Stamp not found' }, { status: 404 });
      
      const totalPrice = (stamp.price || 0) * (quantity || 1);
      if (MOCK_USER.gold < totalPrice) {
        return NextResponse.json({ error: 'Not enough gold' }, { status: 400 });
      }

      // In a real app we'd update the session/user
      return NextResponse.json({ message: 'Purchase successful (Mock)', totalPrice }, { status: 200 });
    }

    const result = await StampService.buyStamp(userId, stampId, quantity || 1);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error buying stamp:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
