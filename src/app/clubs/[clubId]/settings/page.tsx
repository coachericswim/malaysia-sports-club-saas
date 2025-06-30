'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getClubById, updateClub, canUserPerformAction } from '@/lib/services/clubService';
import { Club, SportType, MalaysianState } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft,
  Save,
  Building,
  Phone,
  Clock,
  Globe,
  Shield,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MALAYSIAN_STATES: MalaysianState[] = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
  'Sarawak', 'Selangor', 'Terengganu', 'WP Kuala Lumpur',
  'WP Labuan', 'WP Putrajaya'
];

const SPORTS: SportType[] = [
  'badminton', 'basketball', 'football', 'futsal', 'volleyball',
  'tennis', 'table-tennis', 'swimming', 'golf', 'bowling',
  'squash', 'hockey', 'rugby', 'cricket', 'athletics',
  'cycling', 'martial-arts', 'esports', 'other'
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export default function ClubSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Form states
  const [generalForm, setGeneralForm] = useState({
    name: '',
    description: '',
    sport: '' as SportType,
    established: ''
  });
  
  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    line1: '',
    line2: '',
    city: '',
    state: '' as MalaysianState,
    postcode: ''
  });
  
  const [operatingHours, setOperatingHours] = useState<Club['operatingHours']>({
    monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    saturday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
    sunday: { isOpen: true, openTime: '08:00', closeTime: '20:00' }
  });

  const clubId = params.clubId as string;

  useEffect(() => {
    const fetchClubData = async () => {
      if (!user || !clubId) return;

      try {
        setLoading(true);
        
        // Check permissions
        const canEdit = await canUserPerformAction(clubId, user.id, 'manage_settings');
        setHasPermission(canEdit);
        
        if (!canEdit) {
          toast.error('You do not have permission to manage club settings');
          router.push(`/clubs/${clubId}`);
          return;
        }
        
        // Fetch club data
        const clubData = await getClubById(clubId);
        if (!clubData) {
          router.push('/dashboard');
          return;
        }
        
        setClub(clubData);
        
        // Initialize form data
        setGeneralForm({
          name: clubData.name,
          description: clubData.profile.description,
          sport: Array.isArray(clubData.sport) ? clubData.sport[0] : clubData.sport,
          established: clubData.profile.established ? 
            new Date(clubData.profile.established).toISOString().split('T')[0] : ''
        });
        
        setContactForm({
          email: clubData.contact.email,
          phone: clubData.contact.phone,
          whatsapp: clubData.contact.whatsapp,
          website: clubData.contact.website || '',
          line1: clubData.address.line1,
          line2: clubData.address.line2 || '',
          city: clubData.address.city,
          state: clubData.address.state,
          postcode: clubData.address.postcode
        });
        
        setOperatingHours(clubData.operatingHours);
      } catch (err) {
        console.error('Error fetching club data:', err);
        toast.error('Failed to load club settings');
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [user, clubId, router]);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    
    try {
      setSaving(true);
      
      await updateClub(clubId, {
        name: generalForm.name,
        sport: generalForm.sport,
        profile: {
          ...club.profile,
          description: generalForm.description,
          established: generalForm.established ? new Date(generalForm.established) : club.profile.established
        }
      });
      
      toast.success('General settings updated successfully');
    } catch (error) {
      console.error('Error updating general settings:', error);
      toast.error('Failed to update general settings');
    } finally {
      setSaving(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    
    try {
      setSaving(true);
      
      await updateClub(clubId, {
        contact: {
          email: contactForm.email,
          phone: contactForm.phone,
          whatsapp: contactForm.whatsapp,
          ...(contactForm.website && { website: contactForm.website })
        },
        address: {
          line1: contactForm.line1,
          ...(contactForm.line2 && { line2: contactForm.line2 }),
          city: contactForm.city,
          state: contactForm.state,
          postcode: contactForm.postcode,
          country: 'Malaysia'
        }
      });
      
      toast.success('Contact information updated successfully');
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('Failed to update contact information');
    } finally {
      setSaving(false);
    }
  };

  const handleOperatingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      await updateClub(clubId, {
        operatingHours
      });
      
      toast.success('Operating hours updated successfully');
    } catch (error) {
      console.error('Error updating operating hours:', error);
      toast.error('Failed to update operating hours');
    } finally {
      setSaving(false);
    }
  };

  const handleSportChange = (sport: SportType) => {
    setGeneralForm(prev => ({
      ...prev,
      sport: sport
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission || !club) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/clubs/${clubId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Club
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Club Settings</h1>
              <p className="text-sm text-gray-600">{club.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Only club administrators can modify these settings. Changes will take effect immediately.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Basic information about your club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGeneralSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Club Name</Label>
                    <Input
                      id="name"
                      value={generalForm.name}
                      onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={generalForm.description}
                      onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
                      rows={4}
                      placeholder="Tell members about your club..."
                    />
                  </div>

                  <div>
                    <Label>Club Sport</Label>
                    <Select
                      value={generalForm.sport}
                      onValueChange={(value: SportType) => handleSportChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SPORTS.map((sport) => (
                          <SelectItem key={sport} value={sport}>
                            {sport.charAt(0).toUpperCase() + sport.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="established">Established Date</Label>
                    <Input
                      id="established"
                      type="date"
                      value={generalForm.established}
                      onChange={(e) => setGeneralForm({ ...generalForm, established: e.target.value })}
                    />
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save General Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How members can reach your club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="+60..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={contactForm.whatsapp}
                        onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                        placeholder="+60..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        type="url"
                        value={contactForm.website}
                        onChange={(e) => setContactForm({ ...contactForm, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Address</h3>
                    
                    <div>
                      <Label htmlFor="line1">Address Line 1</Label>
                      <Input
                        id="line1"
                        value={contactForm.line1}
                        onChange={(e) => setContactForm({ ...contactForm, line1: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                      <Input
                        id="line2"
                        value={contactForm.line2}
                        onChange={(e) => setContactForm({ ...contactForm, line2: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={contactForm.city}
                          onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select
                          value={contactForm.state}
                          onValueChange={(value) => setContactForm({ ...contactForm, state: value as MalaysianState })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MALAYSIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="postcode">Postcode</Label>
                        <Input
                          id="postcode"
                          value={contactForm.postcode}
                          onChange={(e) => setContactForm({ ...contactForm, postcode: e.target.value })}
                          pattern="[0-9]{5}"
                          maxLength={5}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Contact Information'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>
                  When your club is open for members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOperatingHoursSubmit} className="space-y-4">
                  {DAYS.map((day) => (
                    <div key={day} className="flex items-center space-x-4 py-2">
                      <div className="w-32">
                        <Label className="capitalize">{day}</Label>
                      </div>
                      <Switch
                        checked={operatingHours[day].isOpen}
                        onCheckedChange={(checked) => 
                          setOperatingHours({
                            ...operatingHours,
                            [day]: { ...operatingHours[day], isOpen: checked }
                          })
                        }
                      />
                      {operatingHours[day].isOpen ? (
                        <>
                          <Input
                            type="time"
                            value={operatingHours[day].openTime}
                            onChange={(e) => 
                              setOperatingHours({
                                ...operatingHours,
                                [day]: { ...operatingHours[day], openTime: e.target.value }
                              })
                            }
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={operatingHours[day].closeTime}
                            onChange={(e) => 
                              setOperatingHours({
                                ...operatingHours,
                                [day]: { ...operatingHours[day], closeTime: e.target.value }
                              })
                            }
                            className="w-32"
                          />
                        </>
                      ) : (
                        <span className="text-gray-500">Closed</span>
                      )}
                    </div>
                  ))}

                  <Button type="submit" disabled={saving} className="mt-6">
                    {saving ? 'Saving...' : 'Save Operating Hours'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}