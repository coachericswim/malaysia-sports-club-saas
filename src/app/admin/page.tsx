'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleGuard from '@/components/auth/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, CreditCard, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={['superadmin']}>
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
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Manage platform settings and users</p>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No clubs yet</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">1 active user</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">RM 0</div>
                  <p className="text-xs text-muted-foreground">No revenue yet</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Club Management</CardTitle>
                  <CardDescription>
                    View and manage all clubs on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    Manage Clubs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View all users and manage their accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    Manage Users
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>
                    Configure global platform settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    Platform Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>
                    Configure Stripe and payment options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    Payment Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    View platform-wide analytics and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>
                    Manage customer support requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    View Tickets
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}