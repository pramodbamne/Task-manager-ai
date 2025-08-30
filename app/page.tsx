// FILE: /app/page.tsx (New Professional UI)

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">AITask</span>
        </div>
        <Button asChild variant="ghost">
          <Link href="/login">
            Login <LogIn className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>
      
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            The Future of Task Management is Here
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10">
            Harness the power of AI to organize your life, streamline your workflow, and achieve your goals faster than ever before.
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            <Link href="/register">Get Started for Free</Link>
          </Button>
        </div>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} AITask. All rights reserved.</p>
      </footer>
    </div>
  );
}