'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Camera, Check, Loader2, Mail, Phone, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { currentUser, firebaseUser, updateUserProfile, sendVerificationEmail, updateUserEmail, updateUserPassword } = useAuth();
  const router = useRouter();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.profile.firstName || '',
    lastName: currentUser?.profile.lastName || '',
    displayName: currentUser?.profile.displayName || '',
    phone: currentUser?.phone || '',
    identificationType: currentUser?.profile.identificationType || 'ic',
    identificationNumber: currentUser?.profile.identificationNumber || ''
  });
  
  // Security form state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    language: currentUser?.preferences.language || 'en',
    emailNotifications: currentUser?.preferences.notifications.email ?? true,
    smsNotifications: currentUser?.preferences.notifications.sms ?? true,
    whatsappNotifications: currentUser?.preferences.notifications.whatsapp ?? true,
    pushNotifications: currentUser?.preferences.notifications.push ?? true,
    showProfile: currentUser?.preferences.privacy.showProfile ?? true,
    showStats: currentUser?.preferences.privacy.showStats ?? true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateUserProfile({
        profile: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          displayName: profileData.displayName,
          identificationType: profileData.identificationType as 'ic' | 'passport',
          identificationNumber: profileData.identificationNumber
        },
        phone: profileData.phone
      });
      
      setSuccessMessage('Profile updated successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateUserEmail(emailData.newEmail, emailData.currentPassword);
      setSuccessMessage('Email updated! Please check your new email for verification.');
      setEmailData({ newEmail: '', currentPassword: '' });
    } catch (error: any) {
      setError(error.message || 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateUserProfile({
        preferences: {
          language: preferences.language as 'en' | 'ms' | 'zh' | 'ta',
          notifications: {
            email: preferences.emailNotifications,
            sms: preferences.smsNotifications,
            whatsapp: preferences.whatsappNotifications,
            push: preferences.pushNotifications
          },
          privacy: {
            showProfile: preferences.showProfile,
            showStats: preferences.showStats
          }
        }
      });
      
      setSuccessMessage('Preferences updated successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    const first = currentUser?.profile.firstName?.[0] || '';
    const last = currentUser?.profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">My Profile</h1>
            </div>
          </div>
        </header>

        <div className="container max-w-4xl mx-auto p-6">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser?.profile.photoURL} />
                    <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    disabled
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{currentUser?.profile.displayName}</h2>
                  <p className="text-muted-foreground">{currentUser?.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {firebaseUser?.emailVerified ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <Check className="h-3 w-3" />
                        Email verified
                      </span>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={async () => {
                          try {
                            await sendVerificationEmail();
                            setSuccessMessage('Verification email sent!');
                          } catch (error) {
                            setError('Failed to send verification email');
                          }
                        }}
                        className="p-0 h-auto"
                      >
                        Verify email
                      </Button>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Member since {new Date(currentUser?.metadata.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="mb-6">
              <Check className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="012-3456789"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="identificationType">ID Type</Label>
                        <Select
                          value={profileData.identificationType}
                          onValueChange={(value) => setProfileData({ ...profileData, identificationType: value })}
                        >
                          <SelectTrigger>
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
                          value={profileData.identificationNumber}
                          onChange={(e) => setProfileData({ ...profileData, identificationNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              {/* Change Email */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Email</CardTitle>
                  <CardDescription>
                    Update your email address. You'll need to verify the new email.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentEmail">Current Email</Label>
                      <Input
                        id="currentEmail"
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">New Email</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={emailData.newEmail}
                        onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailPassword">Current Password</Label>
                      <Input
                        id="emailPassword"
                        type="password"
                        value={emailData.currentPassword}
                        onChange={(e) => setEmailData({ ...emailData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Email'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Ensure your account stays secure with a strong password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              {/* Language */}
              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription>
                    Choose your preferred language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ms">Bahasa Malaysia</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="ta">தமிழ்</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Choose how you want to receive updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences({ ...preferences, emailNotifications: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via SMS
                        </p>
                      </div>
                      <Switch
                        checked={preferences.smsNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences({ ...preferences, smsNotifications: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>WhatsApp Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via WhatsApp
                        </p>
                      </div>
                      <Switch
                        checked={preferences.whatsappNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences({ ...preferences, whatsappNotifications: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive browser notifications
                        </p>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => 
                          setPreferences({ ...preferences, pushNotifications: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy</CardTitle>
                  <CardDescription>
                    Control what others can see about you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Profile to Members</Label>
                        <p className="text-sm text-muted-foreground">
                          Other club members can view your profile
                        </p>
                      </div>
                      <Switch
                        checked={preferences.showProfile}
                        onCheckedChange={(checked) => 
                          setPreferences({ ...preferences, showProfile: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Statistics</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your performance statistics
                        </p>
                      </div>
                      <Switch
                        checked={preferences.showStats}
                        onCheckedChange={(checked) => 
                          setPreferences({ ...preferences, showStats: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handlePreferencesUpdate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}