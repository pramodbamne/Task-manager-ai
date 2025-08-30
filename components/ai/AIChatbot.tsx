// FILE: /components/ai/AIChatbot.tsx (Corrected for Flexible Height)

'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface AIChatbotProps {
    onTaskUpdate: () => void;
}

export default function AIChatbot({ onTaskUpdate }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! How can I help you manage your tasks today? Try 'add a task to buy milk'" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('AI assistant failed to respond.');
      }

      const data = await response.json();
      
      const botMessage: Message = { role: 'bot', content: data.response };
      setMessages((prev) => [...prev, botMessage]);
      
      if(data.actionTaken) {
        onTaskUpdate();
        toast.info("AI assistant updated your tasks.");
      }

    } catch (error) {
      const errorMessage: Message = { role: 'bot', content: error instanceof Error ? error.message : "Sorry, something went wrong." };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-none rounded-none">
      <CardContent className="flex-grow p-4">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'bot' && <div className="p-2 bg-blue-100 rounded-full"><Bot className="h-5 w-5 text-blue-600" /></div>}
                <div className={`rounded-lg p-3 text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {msg.content}
                </div>
                 {msg.role === 'user' && <div className="p-2 bg-gray-200 rounded-full"><User className="h-5 w-5 text-gray-700" /></div>}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Delete my urgent task"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '...' : 'Send'}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}