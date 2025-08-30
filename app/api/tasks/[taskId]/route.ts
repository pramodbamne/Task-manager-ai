import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prismadb from '@/lib/prisma';

interface IParams {
  params: { taskId: string };
}

// Helper function to verify task ownership
async function verifyTaskOwnership(taskId: string, userId: string) {
  const task = await prismadb.task.findUnique({
    where: { id: taskId },
  });

  if (!task || task.userId !== userId) {
    return null;
  }
  return task;
}

// PUT (Update) a task
export async function PUT(req: Request, { params }: IParams) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  try {
    const task = await verifyTaskOwnership(params.taskId, session.user.id);
    if (!task) {
      return new NextResponse('Task not found or unauthorized', { status: 404 });
    }

    const body = await req.json();
    const { description, priority, status, deadline } = body;

    const updatedTask = await prismadb.task.update({
      where: { id: params.taskId },
      data: {
        description,
        priority,
        status,
        deadline,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('[TASK_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE a task
export async function DELETE(req: Request, { params }: IParams) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  try {
    const task = await verifyTaskOwnership(params.taskId, session.user.id);
    if (!task) {
      return new NextResponse('Task not found or unauthorized', { status: 404 });
    }

    await prismadb.task.delete({
      where: { id: params.taskId },
    });

    return new NextResponse('Task deleted', { status: 200 });
  } catch (error) {
    console.error('[TASK_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}