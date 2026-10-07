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
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const router = useRouter();
  const { user, isUserLoading, signIn, signUp } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Landmark className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleAuthAction = async () => {
    setIsLoading(true);

    try {
      const isSignUp = activeTab === 'signup';
      if (isSignUp) {
        if (!name.trim()) {
          toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description: 'Please enter your full name.',
          });
          setIsLoading(false);
          return;
        }

        const { error: sbError } = await signUp(email, password, name.trim());
        if (sbError) {
          throw sbError;
        }

        toast({
          title: 'Sign Up Successful',
          description: 'Account created! Please check your email or proceed to sign in.',
        });
        router.push('/');
      } else {
        const { error: sbError } = await signIn(email, password);
        if (sbError) {
          throw sbError;
        }

        toast({
          title: 'Welcome Back',
          description: 'Successfully signed in to BudgetWise.',
        });
        router.push('/');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message || 'Please check your credentials and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSignUp = activeTab === 'signup';

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Tabs defaultValue="signin" className="w-full max-w-sm" onValueChange={setActiveTab}>
        <Card className="shadow-md border">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center items-center mb-3">
              <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Landmark className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight font-headline">BudgetWise</CardTitle>
            <CardDescription>
              Sign in to manage your budget and track expenses.
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>

          {/* Sign In Form */}
          <TabsContent value="signin" className="mt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuthAction();
              }}
            >
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email address</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading && !isSignUp ? 'Signing In...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* Sign Up Form */}
          <TabsContent value="signup" className="mt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuthAction();
              }}
            >
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="name-signup">Full Name</Label>
                  <Input
                    id="name-signup"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email address</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
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
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email || !password || !name}
                >
                  {isLoading && isSignUp ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* Terms & Privacy Policy */}
          <p className="px-6 pb-6 text-center text-xs text-muted-foreground border-t pt-4 mx-6">
            By signing in or signing up, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </Card>
      </Tabs>
    </div>
  );
}
