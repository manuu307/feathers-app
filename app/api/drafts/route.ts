import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Draft from '@/models/Draft';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const senderId = searchParams.get('senderId');

    if (!senderId) {
      return NextResponse.json({ error: 'Sender ID is required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI || senderId.startsWith('mock-')) {
      return NextResponse.json([], { status: 200 });
    }

    await dbConnect();
    const drafts = await Draft.find({ sender_id: senderId }).sort({ updated_at: -1 });
    return NextResponse.json(drafts, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sender_id, content, receiver_address, stamp_id, scheduled_at } = await req.json();

    if (!sender_id || !content) {
      return NextResponse.json({ error: 'Sender ID and content are required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI || sender_id.startsWith('mock-')) {
      return NextResponse.json({ _id: 'mock-draft-' + Date.now(), sender_id, content, receiver_address, stamp_id, scheduled_at, updated_at: new Date().toISOString() }, { status: 201 });
    }

    await dbConnect();
    const newDraft = new Draft({
      sender_id,
      content,
      receiver_address,
      stamp_id,
      scheduled_at,
    });

    await newDraft.save();
    return NextResponse.json(newDraft, { status: 201 });
  } catch (error: any) {
    console.error('Error creating draft:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
