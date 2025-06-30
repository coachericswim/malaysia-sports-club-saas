'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { createClub } from '@/lib/services/clubService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Building2, Loader2, MapPin, Phone, Globe } from 'lucide-react';
import Link from 'next/link';
import { SportType, MalaysianState } from '@/types';

const SPORTS: { value: SportType; label: string }[] = [
  { value: 'badminton', label: 'Badminton' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'gym', label: 'Gym/Fitness' }
];

const MALAYSIAN_STATES: { value: MalaysianState; label: string }[] = [
  { value: 'WP Kuala Lumpur', label: 'WP Kuala Lumpur' },
  { value: 'Selangor', label: 'Selangor' },
  { value: 'Johor', label: 'Johor' },
  { value: 'Pulau Pinang', label: 'Pulau Pinang' },
  { value: 'Perak', label: 'Perak' },
  { value: 'Negeri Sembilan', label: 'Negeri Sembilan' },
  { value: 'Melaka', label: 'Melaka' },
  { value: 'Pahang', label: 'Pahang' },
  { value: 'Terengganu', label: 'Terengganu' },
  { value: 'Kelantan', label: 'Kelantan' },
  { value: 'Kedah', label: 'Kedah' },
  { value: 'Perlis', label: 'Perlis' },
  { value: 'Sabah', label: 'Sabah' },
  { value: 'Sarawak', label: 'Sarawak' },
  { value: 'WP Labuan', label: 'WP Labuan' },
  { value: 'WP Putrajaya', label: 'WP Putrajaya' }
];

export default function CreateClubPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    sport: '' as SportType,
    registrationType: 'society' as 'society' | 'company' | 'association',
    registrationNumber: '',
    established: new Date().getFullYear().toString(),
    description: '',
    
    // Contact Info
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    
    // Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'WP Kuala Lumpur' as MalaysianState,
    postcode: ''
  });

  const handleSportChange = (sport: SportType) => {
    setFormData(prev => ({
      ...prev,
      sport: sport
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.sport) {
      setError('Please select a sport');
      return;
    }
    
    if (!formData.phone.match(/^(\+?6?01)[0-46-9]-?[0-9]{7,8}$/)) {
      setError('Please enter a valid Malaysian phone number');
      return;
    }
    
    setIsLoading(true);

    try {
      const club = await createClub({
        name: formData.name,
        sport: formData.sport,
        profile: {
          description: formData.description,
          established: new Date(`${formData.established}-01-01`),
          registration: {
            type: formData.registrationType,
            number: formData.registrationNumber
          },
          logo: '',
          coverImage: ''
        },
        contact: {
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          website: formData.website
        },
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: 'Malaysia'
        }
      }, currentUser!.id);
      
      // Redirect to the new club dashboard
      router.push(`/clubs/${club.id}`);
    } catch (error: any) {
      setError(error.message || 'Failed to create club');
    } finally {
      setIsLoading(false);
    }
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
              <div>
                <h1 className="text-2xl font-bold">Initial Club Setup</h1>
                <p className="text-sm text-muted-foreground">One-time configuration for your club management system</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container max-w-4xl mx-auto p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell us about your sports club
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Club Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., KL Badminton Academy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Club Sport *</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value: SportType) => handleSportChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your club's sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS.map(sport => (
                        <SelectItem key={sport.value} value={sport.value}>
                          {sport.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationType">Registration Type</Label>
                    <Select
                      value={formData.registrationType}
                      onValueChange={(value: any) => setFormData({ ...formData, registrationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="society">Society (ROS)</SelectItem>
                        <SelectItem value="company">Company (SSM)</SelectItem>
                        <SelectItem value="association">Association</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="e.g., PPM-123-456"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="established">Year Established</Label>
                  <Input
                    id="established"
                    type="number"
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.established}
                    onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your club, its mission, and what makes it special..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How can members reach you?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="club@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="012-3456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="Same as phone or different"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.yourclub.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Where is your club located?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    placeholder="Street address, building name"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Floor, unit number (optional)"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Petaling Jaya"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value: MalaysianState) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MALAYSIAN_STATES.map(state => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      placeholder="e.g., 47800"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      required
                      maxLength={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating club...
                  </>
                ) : (
                  'Create Club'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}