import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, email, password, turnstileToken } = await request.json();
    
    // Verify Turnstile
    const verification = await verifyTurnstileToken(turnstileToken);
    if (!verification.success) {
      return NextResponse.json(
        { error: 'Bot detection failed. Please try again.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create user
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpiry,
      isVerified: false,
    });

    // Send verification email
    const { sendVerificationEmail } = await import('@/lib/email');
    await sendVerificationEmail(user.email, verificationToken, user.name);
    
    // Return user without password
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 