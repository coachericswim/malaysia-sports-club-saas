'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getTheClub } from '@/lib/services/clubService';
import { Club } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  AlertCircle,
  CheckCircle,
  Loader2,
  UserPlus,
  Heart,
  Users
} from 'lucide-react';

export default function MemberRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Account Info
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal Info
    firstName: '',
    lastName: '',
    displayName: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    identificationType: 'ic' as 'ic' | 'passport',
    identificationNumber: '',
    
    // Contact Info
    phone: '',
    address: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    
    // Medical Info
    medicalConditions: '',
    allergies: '',
    bloodType: ''
  });

  useEffect(() => {
    const validateAndLoadData = async () => {
      try {
        // Get the club first
        const clubData = await getTheClub();
        if (!clubData) {
          setError('No club found. Please contact your administrator.');
          return;
        }
        setClub(clubData);
        
        // Validate the invitation token
        const invitationQuery = query(
          collection(db, 'clubs', clubData.id, 'invitations'),
          where('code', '==', token)
        );
        const invitationSnapshot = await getDocs(invitationQuery);
        
        if (invitationSnapshot.empty) {
          setError('Invalid registration link. Please contact your club administrator.');
          return;
        }
        
        const invitationDoc = invitationSnapshot.docs[0];
        const invitationData = invitationDoc.data();
        
        // Check if invitation is expired
        if (invitationData.expiresAt && invitationData.expiresAt.toDate() < new Date()) {
          setError('This registration link has expired. Please request a new one.');
          return;
        }
        
        // Check if it's a bulk invitation that has reached its limit
        if (invitationData.type === 'bulk' && invitationData.memberLimit && 
            invitationData.usedCount >= invitationData.memberLimit) {
          setError('This registration link has reached its member limit.');
          return;
        }
        
        setInvitation({ id: invitationDoc.id, ...invitationData });
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load registration form.');
      } finally {
        setLoading(false);
      }
    };
    
    validateAndLoadData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!formData.phone.match(/^(\+?6?01)[0-46-9]-?[0-9]{7,8}$/)) {
      setError('Please enter a valid Malaysian phone number');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create Firebase auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const userId = userCredential.user.uid;
      
      // Create user document
      await setDoc(doc(db, 'users', userId), {
        email: formData.email,
        phone: formData.phone,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
          gender: formData.gender,
          nationality: 'Malaysian',
          identificationType: formData.identificationType,
          identificationNumber: formData.identificationNumber
        },
        auth: {
          role: 'member',
          emailVerified: false,
          phoneVerified: false,
          twoFactorEnabled: false,
          lastLogin: new Date(),
          loginCount: 1
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: true,
            whatsapp: true,
            push: true
          },
          privacy: {
            showProfile: true,
            showStats: true
          }
        },
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone
        },
        medical: {
          conditions: formData.medicalConditions,
          allergies: formData.allergies,
          bloodType: formData.bloodType
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActive: new Date()
        }
      });
      
      // Add user as club member
      if (club) {
        const memberRef = doc(db, 'clubs', club.id, 'members', userId);
        await setDoc(memberRef, {
          userId: userId,
          clubId: club.id,
          role: 'member',
          permissions: ['view'],
          joinedAt: new Date(),
          status: 'active',
          registrationToken: token
        });
        
        // Update club stats
        await setDoc(doc(db, 'clubs', club.id), {
          'stats.totalMembers': (club.stats.totalMembers || 0) + 1,
          'stats.activeMembers': (club.stats.activeMembers || 0) + 1
        }, { merge: true });
        
        // Update invitation usage
        if (invitation) {
          if (invitation.type === 'bulk') {
            // Increment used count for bulk invitations
            await updateDoc(doc(db, 'clubs', club.id, 'invitations', invitation.id), {
              usedCount: (invitation.usedCount || 0) + 1,
              lastUsedAt: new Date()
            });
          } else {
            // Mark individual invitation as used
            await updateDoc(doc(db, 'clubs', club.id, 'invitations', invitation.id), {
              status: 'used',
              usedAt: new Date(),
              usedBy: userId
            });
          }
        }
      }
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else {
        setError(err.message || 'Failed to complete registration. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Invalid registration link. Please contact your club administrator.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              Welcome to {club.name}! You can now login to access your member dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Club Header */}
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Join {club.name}</h1>
          <p className="text-gray-600">
            {club.sport.charAt(0).toUpperCase() + club.sport.slice(1).replace('-', ' ')} Club • {club.address.city}, {club.address.state}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Create your login credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Tell us about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="identificationType">ID Type *</Label>
                  <select
                    id="identificationType"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.identificationType}
                    onChange={(e) => setFormData({ ...formData, identificationType: e.target.value as any })}
                    required
                  >
                    <option value="ic">Malaysian IC</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="identificationNumber">ID Number *</Label>
                  <Input
                    id="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                    placeholder={formData.identificationType === 'ic' ? '123456-12-1234' : 'A12345678'}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="012-3456789"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                In case of emergency, who should we contact?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergencyName">Contact Name *</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship *</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone Number *</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="012-3456789"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical Information
              </CardTitle>
              <CardDescription>
                Optional but helpful for your safety
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <select
                  id="bloodType"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder="e.g., Asthma, Diabetes, Heart conditions"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g., Peanuts, Shellfish, Medications"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Complete Registration
              </>
            )}
          </Button>
          
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}