// FILE: /app/(auth)/login/page.tsx (New Professional UI)

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bot } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error('Login Failed: ' + result.error);
    } else if (result?.ok) {
      toast.success('Login successful!');
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/10 dark:to-indigo-900/20 z-0"></div>
        <Card className="w-full max-w-md z-10 shadow-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
                    <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                <CardDescription>Access your AI-powered task dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                 Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:underline">
                    Register
                </Link>
                </p>
                <p>
                <Link href="/forgot-password" className="font-medium text-blue-600 hover:underline">
                    Forgot Password?
                </Link>
                </p>
            </div>
            </CardContent>
        </Card>
    </div>
  );
}