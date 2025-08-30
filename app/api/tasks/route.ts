import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prismadb from '@/lib/prisma';
import { resend } from '@/lib/resend';

// GET all tasks for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  try {
    const tasks = await prismadb.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST a new task
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  try {
    const body = await req.json();
    const { description, priority, status, deadline } = body;

    if (!description) {
      return new NextResponse('Description is required', { status: 400 });
    }

    const task = await prismadb.task.create({
      data: {
        description,
        priority,
        status,
        deadline,
        userId: session.user.id,
      },
    });

    // Send email notification
    if (session.user.email) {
        await resend.emails.send({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: session.user.email,
            subject: 'New Task Created!',
            html: `<p>A new task has been added to your list: <strong>${description}</strong></p>`,
        });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('[TASKS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}