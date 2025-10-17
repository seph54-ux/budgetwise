'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Landmark className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleAuthAction = async () => {
    setIsLoading(true);
    const isSignUp = activeTab === 'signup';
    try {
      if (isSignUp) {
        if (!name) {
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: 'Please enter your full name.',
            });
            setIsLoading(false);
            return;
        }
        await initiateEmailSignUp(auth, email, password, name);
      } else {
        await initiateEmailSignIn(auth, email, password);
      }
      // Non-blocking, listener will redirect. The await here is for catching errors.
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

  const isSignUp = activeTab === 'signup';

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Tabs defaultValue="signin" className="w-full max-w-sm" onValueChange={setActiveTab}>
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Landmark className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Welcome to BudgetWise</CardTitle>
            <CardDescription>
              Sign in or create an account to manage your finances.
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="signin">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input
                  id="password-signin"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleAuthAction}
                disabled={isLoading || !email || !password}
              >
                {isLoading && !isSignUp ? 'Signing In...' : 'Sign In'}
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="signup">
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name-signup">Full Name</Label>
                    <Input
                    id="name-signup"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleAuthAction}
                disabled={isLoading || !email || !password || !name}
              >
                {isLoading && isSignUp ? 'Signing Up...' : 'Sign Up'}
              </button>
            </CardFooter>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
