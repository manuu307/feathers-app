import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { CreateUserSchema } from '@/lib/validation';
import { ZodError } from 'zod';
import { MOCK_USER } from '@/lib/mocks';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check for demo/mock mode
    if (!process.env.MONGODB_URI || body.address === 'elder-thorne') {
      console.log('Using mock user data (DB missing or demo address)');
      return NextResponse.json(MOCK_USER, { status: 201 });
    }
    
    // Validate input
    const validatedData = CreateUserSchema.parse(body);
    
    const newUser = await UserService.createUser(validatedData);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    if (error.message === 'Address already claimed') {
      return NextResponse.json({ error: 'Address already claimed' }, { status: 409 });
    }
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
