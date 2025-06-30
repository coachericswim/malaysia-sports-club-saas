'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    identificationType: 'ic' as 'ic' | 'passport',
    identificationNumber: '',
    agreeToTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, identificationType: value as 'ic' | 'passport' }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeToTerms: checked }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Malaysian phone number validation
    if (formData.phone && !formData.phone.match(/^(\+?6?01)[0-46-9]-?[0-9]{7,8}$/)) {
      setError('Please enter a valid Malaysian phone number');
      return false;
    }
    
    // IC number validation (basic)
    if (formData.identificationType === 'ic' && formData.identificationNumber) {
      if (!formData.identificationNumber.match(/^\d{12}$/)) {
        setError('IC number must be 12 digits');
        return false;
      }
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      await register(formData.email, formData.password, {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
          identificationType: formData.identificationType,
          identificationNumber: formData.identificationNumber,
          nationality: 'Malaysian'
        },
        phone: formData.phone || undefined
      });
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">MS</span>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Join Malaysian Sports Club to manage your club
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Ahmad"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Rahman"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="012-3456789"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">
              Malaysian phone number format
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identificationType">ID Type</Label>
              <Select
                value={formData.identificationType}
                onValueChange={handleSelectChange}
                disabled={isLoading}
              >
                <SelectTrigger id="identificationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ic">IC Number</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="identificationNumber">ID Number</Label>
              <Input
                id="identificationNumber"
                name="identificationNumber"
                placeholder={formData.identificationType === 'ic' ? '990101101234' : 'A12345678'}
                value={formData.identificationNumber}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 6 characters
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={handleCheckboxChange}
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !formData.agreeToTerms}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </CardContent>
      
      <CardFooter>
        <div className="text-sm text-center w-full">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}