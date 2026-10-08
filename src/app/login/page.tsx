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
        <div className="size-16 rounded-2xl neu-pressed-sm flex items-center justify-center text-primary animate-pulse">
          <Landmark className="size-8" />
        </div>
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
    <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center mb-3">
              <div className="size-16 rounded-2xl neu-pressed-sm flex items-center justify-center text-primary shadow-sm">
                <Landmark className="size-8" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-headline text-foreground">
              BudgetWise
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Smart, effortless budget tracking and savings goals
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Form */}
            <TabsContent value="signin" className="mt-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthAction();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email-signin" className="text-xs font-semibold">
                    Email address
                  </Label>
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
                  <Label htmlFor="password-signin" className="text-xs font-semibold">
                    Password
                  </Label>
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

                <Button
                  type="submit"
                  className="w-full neu-primary-btn mt-6 h-11 text-sm font-semibold"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading && !isSignUp ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Form */}
            <TabsContent value="signup" className="mt-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthAction();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name-signup" className="text-xs font-semibold">
                    Full Name
                  </Label>
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
                  <Label htmlFor="email-signup" className="text-xs font-semibold">
                    Email address
                  </Label>
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
                  <Label htmlFor="password-signup" className="text-xs font-semibold">
                    Password
                  </Label>
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

                <Button
                  type="submit"
                  className="w-full neu-primary-btn mt-6 h-11 text-sm font-semibold"
                  disabled={isLoading || !email || !password || !name}
                >
                  {isLoading && isSignUp ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Terms & Privacy Policy */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5 text-center">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
