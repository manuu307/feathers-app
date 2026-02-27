import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Draft from '@/models/Draft';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const senderId = searchParams.get('senderId');

    if (!senderId) {
      return NextResponse.json({ error: 'Sender ID is required' }, { status: 400 });
    }

    const drafts = await Draft.find({ sender_id: senderId }).sort({ updated_at: -1 });
    return NextResponse.json(drafts, { status: 200 });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { sender_id, content, receiver_address, stamp_id } = await req.json();

    if (!sender_id || !content) {
      return NextResponse.json({ error: 'Sender ID and content are required' }, { status: 400 });
    }

    const newDraft = new Draft({
      sender_id,
      content,
      receiver_address,
      stamp_id,
    });

    await newDraft.save();
    return NextResponse.json(newDraft, { status: 201 });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
