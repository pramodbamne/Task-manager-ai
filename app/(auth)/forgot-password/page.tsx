// FILE: /app/(auth)/forgot-password/page.tsx (New Professional UI)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setIsLoading(false);

    if (response.ok) {
      toast.success('An OTP has been sent to your email.');
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      const data = await response.json();
      toast.error('Error: ' + (data.error || 'Could not send OTP.'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/10 dark:to-indigo-900/20 z-0"></div>
      <Card className="w-full max-w-md z-10 shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
                <KeyRound className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset OTP.</CardDescription>
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
                <Link href="/login" className="font-medium text-blue-600 hover:underline">
                    Back to Login
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}