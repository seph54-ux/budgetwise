'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
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
import { verifyRecaptcha } from '@/ai/flows/verify-recaptcha-flow';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig() || {};
const siteKey = publicRuntimeConfig?.recaptchaSiteKey;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

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
  
  if (!siteKey) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Configuration Error</CardTitle>
                    <CardDescription>
                        The reCAPTCHA site key is missing. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your environment.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
  }

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleAuthAction = async () => {
    setIsLoading(true);
    
    if (!recaptchaToken) {
      toast({
        variant: 'destructive',
        title: 'reCAPTCHA Required',
        description: 'Please complete the reCAPTCHA challenge.',
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Verify reCAPTCHA token on the server
      const isVerified = await verifyRecaptcha(recaptchaToken);
      if (!isVerified) {
        throw new Error('reCAPTCHA verification failed. Please try again.');
      }

      // 2. Proceed with auth action
      const isSignUp = activeTab === 'signup';
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
      // Non-blocking, listener will redirect.
    } catch (error: any) {
      console.error(error);
      let title = 'An unexpected error occurred.';
      let description = 'Please try again later.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
            title = 'Invalid Email';
            description = 'Please enter a valid email address.';
            break;
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
             title = 'Authentication Error'
             description = error.message;
            break;
        }
      } else if (error instanceof Error) {
        title = 'Error';
        description = error.message;
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });

    } finally {
        // Reset reCAPTCHA after any attempt
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        setIsLoading(false);
    }
  };

  const isSignUp = activeTab === 'signup';

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Tabs defaultValue="signin" className="w-full max-w-sm" onValueChange={
        (value) => {
            setActiveTab(value);
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
        }
      }>
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
            <CardFooter className="flex-col gap-4">
               <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={handleRecaptchaChange}
              />
              <Button
                className="w-full"
                onClick={handleAuthAction}
                disabled={isLoading || !email || !password || !recaptchaToken}
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
            <CardFooter className="flex-col gap-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={handleRecaptchaChange}
              />
              <Button
                className="w-full"
                onClick={handleAuthAction}
                disabled={isLoading || !email || !password || !name || !recaptchaToken}
              >
                {isLoading && isSignUp ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </CardFooter>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
