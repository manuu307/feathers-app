import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI || userId.startsWith('mock-')) {
      return NextResponse.json([], { status: 200 });
    }

    await dbConnect();
    const notes = await Note.find({ user_id: userId }).sort({ created_at: -1 });
    return NextResponse.json(notes, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user_id, content, color } = await req.json();

    if (!user_id || !content) {
      return NextResponse.json({ error: 'User ID and content are required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI || user_id.startsWith('mock-')) {
      return NextResponse.json({ _id: 'mock-note-' + Date.now(), user_id, content, color, created_at: new Date().toISOString() }, { status: 201 });
    }

    await dbConnect();
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newNote = new Note({
      user_id,
      content,
      color: color || 'yellow',
    });

    await newNote.save();
    return NextResponse.json(newNote, { status: 201 });
  } catch (error: any) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
