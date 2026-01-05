import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { User, Todo } from '@/lib/models';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Find user with password
    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 });
    }
    
    // 1. Delete all todos associated with the user
    await Todo.deleteMany({ user: session.user.id });
    
    // 2. Delete the user
    await User.findByIdAndDelete(session.user.id);
    
    return NextResponse.json({ message: 'Account and associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
