import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    
    // Find user with this token and ensure it hasn't expired
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    }).select('+verificationToken +verificationTokenExpiry');
    
    if (!user) {
      // If no valid token found, redirect to signin with error
      return NextResponse.redirect(new URL(`${process.env.BASE_URL}/auth/signin?error=Verification link invalid or expired`));
    }
    
    // Update user: verify and clear token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    // Redirect to signin with success message
    return NextResponse.redirect(new URL(`${process.env.BASE_URL}/auth/signin?verified=true`));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL(`${process.env.BASE_URL}/auth/signin?error=An error occurred during verification`));
  }
}
