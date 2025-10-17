'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Landmark } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Landmark className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (user) {
    router.push('/');
    return null;
  }

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    setIsLoading(true);
    try {
      if (action === 'signUp') {
        initiateEmailSignUp(auth, email, password);
      } else {
        initiateEmailSignIn(auth, email, password);
      }
      // Non-blocking, listener will redirect
    } catch (error) {
        console.error(error);
        let title = 'An unexpected error occurred.';
        let description = 'Please try again later.';
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/invalid-email':
                    title = 'Invalid Email';
                    description = 'Please enter a valid email address.';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    title = 'Sign In Failed';
                    description = 'Incorrect email or password.';
                    break;
                case 'auth/email-already-in-use':
                    title = 'Sign Up Failed';
                    description = 'An account with this email already exists.';
                    break;
                case 'auth/weak-password':
                    title = 'Sign Up Failed';
                    description = 'Password should be at least 6 characters.';
                    break;
                 default:
                    break;
            }
        }
       
        toast({
            variant: 'destructive',
            title: title,
            description: description,
        });

    } finally {
        // In non-blocking, we don't wait, so we can't reliably set loading to false here.
        // UI will be enabled, user sees toast on error.
        // Let's keep it loading for a bit to avoid rapid clicks.
        setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Landmark className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Welcome to BudgetWise</CardTitle>
          <CardDescription>
            Sign in or create an account to manage your finances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={() => handleAuthAction('signIn')}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleAuthAction('signUp')}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
