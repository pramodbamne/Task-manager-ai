import { NextResponse } from 'next/server';
import prismadb from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const existingUser = await prismadb.user.findUnique({ where: { email } });

    if (existingUser) {
      return new NextResponse('Email already in use', { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prismadb.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[REGISTER_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}