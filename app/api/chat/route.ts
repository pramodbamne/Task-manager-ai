// FILE: /app/api/chat/route.ts (Updated for Gemini)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prismadb from '@/lib/prisma';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Gemini API key is not defined in environment variables');
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Use a powerful and fast model
    generationConfig: {
        responseMimeType: "application/json",
    },
});

// System prompt to guide the Gemini AI
const systemPrompt = `
You are an intelligent task manager assistant. Your goal is to help users manage their tasks by interpreting their natural language commands.
When a user gives a command, you must understand their intent (create, delete, or read a task).
You must respond with a JSON object that strictly follows this schema:
{
  "action": "CREATE" | "DELETE" | "READ" | "NONE",
  "payload": {
    "description": string,
    "priority": "LOW" | "NORMAL" | "HIGH" | "URGENT",
    "status": "TODO" | "IN_PROGRESS" | "DONE",
    "deadline": "YYYY-MM-DDTHH:mm:ss.sssZ",
    "filter": { "priority": "URGENT" }
  },
  "response": "A friendly, conversational response to the user."
}

The current date is ${new Date().toISOString()}.

Examples:
1. User: "Add a task: Submit project report tomorrow at 5pm and set priority to urgent"
   AI: {
     "action": "CREATE",
     "payload": { "description": "Submit project report", "priority": "URGENT", "deadline": "YYYY-MM-DDTHH:17:00:00.000Z" },
     "response": "I've added 'Submit project report' to your tasks with an urgent priority, due tomorrow at 5 PM."
   }

2. User: "Delete my urgent task"
   AI: {
     "action": "DELETE",
     "payload": { "filter": { "priority": "URGENT" } },
     "response": "I've deleted your most recent urgent task. Is there anything else?"
   }

If a user asks to delete a task based on a filter (like priority), target the most recently created task that matches.
If you cannot determine an action, set action to "NONE" and provide a helpful response.
Be concise and helpful in your textual response.
`;


export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  try {
    const { message } = await req.json();

    const chat = model.startChat({
        history: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });
    
    const result = await chat.sendMessage(message);
    const response = result.response;
    const aiResponseText = response.text();
    
    const aiResponse = JSON.parse(aiResponseText);
    let actionTaken = false;

    // --- Perform database actions based on AI response ---
    if (aiResponse.action === 'CREATE' && aiResponse.payload.description) {
      await prismadb.task.create({
        data: {
          description: aiResponse.payload.description,
          priority: aiResponse.payload.priority,
          status: aiResponse.payload.status,
          deadline: aiResponse.payload.deadline,
          userId: session.user.id,
        },
      });
      actionTaken = true;
    } else if (aiResponse.action === 'DELETE' && aiResponse.payload.filter) {
      const tasksToDelete = await prismadb.task.findMany({
        where: {
          userId: session.user.id,
          ...aiResponse.payload.filter,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1, // Delete the most recent one matching the filter
      });

      if (tasksToDelete.length > 0) {
        await prismadb.task.delete({
          where: { id: tasksToDelete[0].id },
        });
        actionTaken = true;
      } else {
        aiResponse.response = "I couldn't find a task matching that description to delete.";
      }
    }

    return NextResponse.json({ response: aiResponse.response, actionTaken });
  } catch (error) {
    console.error('[CHAT_POST_GEMINI]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}