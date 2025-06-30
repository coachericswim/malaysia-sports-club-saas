'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { getUserClubs } from '@/lib/services/clubService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Users, Calendar, DollarSign } from 'lucide-react';
import { Club } from '@/types';

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserClubs = async () => {
      if (currentUser) {
        const userClubs = await getUserClubs(currentUser.id);
        setClubs(userClubs);
        setIsLoading(false);
      }
    };
    
    fetchUserClubs();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full" />
              <span className="text-xl font-bold">Malaysian Sports Club</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {currentUser?.profile.displayName || currentUser?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.profile.displayName}!</h1>
            <p className="text-muted-foreground">
              {clubs.length === 0 
                ? "Get started by creating your first sports club"
                : `You manage ${clubs.length} ${clubs.length === 1 ? 'club' : 'clubs'}`
              }
            </p>
          </div>

          {/* Clubs Section */}
          {clubs.length === 0 ? (
            <Card className="mb-8">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No clubs yet</h2>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create your first sports club to start managing members, schedules, and payments
                </p>
                <Button onClick={() => router.push('/clubs/create')} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Club
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Clubs</h2>
                <Button onClick={() => router.push('/clubs/create')} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Club
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clubs.map(club => (
                  <Card 
                    key={club.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/clubs/${club.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {club.name}
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>
                        {club.sport.join(', ')} • {club.address.city}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{club.stats.totalMembers}</p>
                          <p className="text-xs text-muted-foreground">Members</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{club.stats.activeMembers}</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">RM {club.stats.monthlyRevenue}</p>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
      
      {/* Stats Grid - Show aggregate stats if user has clubs */}
      {clubs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Total Members</h3>
            <p className="text-2xl font-bold mt-2">
              {clubs.reduce((sum, club) => sum + club.stats.totalMembers, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Across all clubs</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
            <p className="text-2xl font-bold mt-2">
              RM {clubs.reduce((sum, club) => sum + club.stats.monthlyRevenue, 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Combined revenue</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Active Members</h3>
            <p className="text-2xl font-bold mt-2">
              {clubs.reduce((sum, club) => sum + club.stats.activeMembers, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Total Clubs</h3>
            <p className="text-2xl font-bold mt-2">{clubs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Under management</p>
          </div>
        </div>
      )}

        </div>
      </div>
    </ProtectedRoute>
  );
}