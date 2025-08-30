import { NextResponse } from 'next/server';
import prismadb from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    const user = await prismadb.user.findUnique({ where: { email } });
    if (!user) {
      // Return a generic message to prevent user enumeration
      return new NextResponse('If a user with that email exists, an OTP has been sent.', { status: 200 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    
    // Store OTP in Redis with a 10-minute expiry
    await redis.set(otpKey, otp, { ex: 600 });

    // Send OTP via email
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Your Password Reset OTP',
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    return new NextResponse('If a user with that email exists, an OTP has been sent.', { status: 200 });
  } catch (error) {
    console.error('[FORGOT_PASSWORD_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}