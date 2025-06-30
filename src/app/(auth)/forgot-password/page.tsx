'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Please check your email and follow the instructions to reset your password. 
              The link will expire in 1 hour.
            </AlertDescription>
          </Alert>
          
          <p className="text-sm text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>
        </CardContent>
        
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">MS</span>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Forgot password?</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset email...
              </>
            ) : (
              'Send reset email'
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter>
        <Link href="/login" className="w-full">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}