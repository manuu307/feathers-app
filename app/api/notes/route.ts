import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const notes = await Note.find({ user_id: userId }).sort({ created_at: -1 });
    return NextResponse.json(notes, { status: 200 });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { user_id, content, color } = await req.json();

    if (!user_id || !content) {
      return NextResponse.json({ error: 'User ID and content are required' }, { status: 400 });
    }

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
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
