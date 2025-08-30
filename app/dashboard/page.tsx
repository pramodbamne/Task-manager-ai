// FILE: /app/dashboard/page.tsx (Corrected to remove isLoading state)

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskDataTable } from '@/components/tasks/TaskDataTable';
import { columns } from '@/components/tasks/Columns';
import { Task } from '@prisma/client';
import { toast } from 'sonner';
import AIChatbot from '@/components/ai/AIChatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, ListTodo, LogOut, X } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          signOut({ callbackUrl: '/login' });
        }
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) return;
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
                <Bot className="h-7 w-7 text-blue-600" />
                <span className="text-xl font-bold text-gray-800 dark:text-white">AITask Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Welcome, <span className="font-semibold">{session.user?.name || 'User'}</span>!
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-6 w-6 text-blue-600" />
              <span>Your Task List</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskDataTable columns={columns(fetchTasks)} data={tasks} onTaskUpdate={fetchTasks} />
          </CardContent>
        </Card>
      </main>

      {/* --- FLOATING AI ASSISTANT --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isAiAssistantOpen && (
           <div className="transition-all duration-300 ease-in-out">
             <Card className="w-[380px] h-[500px] shadow-2xl flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Bot className="h-6 w-6 text-blue-600" />
                        <span>AI Assistant</span>
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAiAssistantOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <AIChatbot onTaskUpdate={fetchTasks} />
                </CardContent>
            </Card>
           </div>
        )}

        <Button
          onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
          className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-xl flex items-center justify-center"
        >
          {isAiAssistantOpen ? <X className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
        </Button>
      </div>
    </div>
  );
}