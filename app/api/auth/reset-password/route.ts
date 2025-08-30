import { NextResponse } from 'next/server';
import prismadb from '@/lib/prisma';
import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const otpKey = `otp:${email}`;
    const storedOtp = await redis.get(otpKey);

    if (!storedOtp || storedOtp !== otp) {
      return new NextResponse('Invalid or expired OTP', { status: 400 });
    }

    const user = await prismadb.user.findUnique({ where: { email } });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prismadb.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Invalidate the OTP after use
    await redis.del(otpKey);

     // Send confirmation email
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Your Password Has Been Reset',
      html: `<p>Your password has been successfully reset. If you did not make this change, please contact our support immediately.</p>`,
    });

    return new NextResponse('Password reset successfully', { status: 200 });
  } catch (error) {
    console.error('[RESET_PASSWORD_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}