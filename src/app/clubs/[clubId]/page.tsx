'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getClubById, getClubMember } from '@/lib/services/clubService';
import { Club, ClubMember } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Calendar, 
  Settings, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  DollarSign,
  UserPlus,
  Trophy,
  Building
} from 'lucide-react';

export default function ClubDashboard() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [userMember, setUserMember] = useState<ClubMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clubId = params.clubId as string;

  useEffect(() => {
    const fetchClubData = async () => {
      if (!user || !clubId) return;

      try {
        setLoading(true);
        
        // Fetch club data
        const clubData = await getClubById(clubId);
        if (!clubData) {
          setError('Club not found');
          return;
        }
        
        // Fetch user membership data
        const memberData = await getClubMember(clubId, user.id);
        if (!memberData) {
          setError('You are not a member of this club');
          return;
        }

        setClub(clubData);
        setUserMember(memberData);
      } catch (err) {
        console.error('Error fetching club data:', err);
        setError('Failed to load club data');
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [user, clubId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error || 'Club not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getRoleColor(userMember?.role || 'member')}>
                {userMember?.role || 'Member'}
              </Badge>
              <Button onClick={() => router.push(`/clubs/${clubId}/settings`)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  {club.sport.charAt(0).toUpperCase() + club.sport.slice(1).replace('-', ' ')}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {club.address.city}, {club.address.state}
                </div>
                <Badge className={getStatusColor(club.status)}>
                  {club.status.charAt(0).toUpperCase() + club.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          
          {club.profile.description && (
            <p className="text-gray-700 mb-4">{club.profile.description}</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{club.stats.totalMembers}</p>
                  <p className="text-sm text-gray-600">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{club.stats.activeMembers}</p>
                  <p className="text-sm text-gray-600">Active Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">RM {club.stats.monthlyRevenue}</p>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{club.stats.facilities}</p>
                  <p className="text-sm text-gray-600">Facilities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for club management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" onClick={() => router.push(`/clubs/${clubId}/members/invite`)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite New Members
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push(`/clubs/${clubId}/events`)}>
                <Calendar className="w-4 h-4 mr-2" />
                Manage Events
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push(`/clubs/${clubId}/tournaments`)}>
                <Trophy className="w-4 h-4 mr-2" />
                Tournament Management
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push(`/clubs/${clubId}/members`)}>
                <Users className="w-4 h-4 mr-2" />
                View All Members
              </Button>
            </CardContent>
          </Card>

          {/* Club Information */}
          <Card>
            <CardHeader>
              <CardTitle>Club Information</CardTitle>
              <CardDescription>Contact details and basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{club.contact.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{club.contact.email}</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p>{club.address.line1}</p>
                  {club.address.line2 && <p>{club.address.line2}</p>}
                  <p>{club.address.postcode} {club.address.city}</p>
                  <p>{club.address.state}, {club.address.country}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Operating Hours
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>{club.operatingHours.monday.openTime} - {club.operatingHours.monday.closeTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday:</span>
                    <span>{club.operatingHours.saturday.openTime} - {club.operatingHours.saturday.closeTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Current plan and member limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <Badge className="mt-1 capitalize">{club.subscription.plan}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-medium">{new Date(club.subscription.validUntil).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Limit</p>
                <p className="font-medium">{club.stats.totalMembers} / {club.subscription.memberLimit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}