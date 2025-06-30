'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { getTheClub } from '@/lib/services/clubService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  UserPlus,
  Trophy,
  Settings,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Club } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubData = async () => {
      if (currentUser) {
        try {
          const clubData = await getTheClub();
          if (clubData) {
            setClub(clubData);
          } else {
            setError('No club found. Please contact your administrator.');
          }
        } catch (err) {
          console.error('Error fetching club:', err);
          setError('Failed to load club data.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchClubData();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading club data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !club) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full" />
                <span className="text-xl font-bold">Club Management System</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </header>
          <div className="container mx-auto p-6">
            <Alert className="max-w-2xl mx-auto mt-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'No club data available. Please contact your administrator to set up the club.'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">{club.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {currentUser?.profile.displayName || currentUser?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/clubs/${club.id}/settings`)}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6">
          {/* Club Overview */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{club.name} Dashboard</h1>
            <p className="text-muted-foreground">
              {club.sport.charAt(0).toUpperCase() + club.sport.slice(1).replace('-', ' ')} Club • {club.address.city}, {club.address.state}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push(`/clubs/${club.id}/members/invite`)}
            >
              <UserPlus className="h-8 w-8" />
              <span>Invite Members</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push(`/clubs/${club.id}/members`)}
            >
              <Users className="h-8 w-8" />
              <span>View Members</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push(`/clubs/${club.id}/schedule`)}
            >
              <Calendar className="h-8 w-8" />
              <span>Schedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.push(`/clubs/${club.id}/payments`)}
            >
              <DollarSign className="h-8 w-8" />
              <span>Payments</span>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{club.stats.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  {club.stats.activeMembers} active members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RM {club.stats.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Members checked in
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Event</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Days until tournament
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest member activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">New member joined: Ahmad Rahman</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">Payment received from Sarah Lee</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">Training session scheduled for tomorrow</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>Today's schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Open
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Today's Hours</span>
                    <span className="text-sm text-muted-foreground">
                      {club.operatingHours[new Date().toLocaleLowerCase() as keyof typeof club.operatingHours].openTime} - {club.operatingHours[new Date().toLocaleLowerCase() as keyof typeof club.operatingHours].closeTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Facilities Available</span>
                    <span className="text-sm text-muted-foreground">{club.stats.facilities} courts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}