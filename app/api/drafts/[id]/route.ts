import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Draft from '@/models/Draft';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { content, receiver_address, stamp_id } = await req.json();

    const updatedDraft = await Draft.findByIdAndUpdate(
      id,
      { content, receiver_address, stamp_id, updated_at: new Date() },
      { new: true }
    );

    if (!updatedDraft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDraft, { status: 200 });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedDraft = await Draft.findByIdAndDelete(id);
    if (!deletedDraft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Draft deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
