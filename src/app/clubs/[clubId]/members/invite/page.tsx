'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  getClubById,
  createClubInvitation,
  getClubInvitations,
  canUserPerformAction
} from '@/lib/services/clubService';
import { Club } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft,
  Mail,
  Send,
  Copy,
  Clock,
  UserPlus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Invitation {
  id: string;
  code: string;
  email: string;
  role: string;
  status: string;
  createdAt: any;
  expiresAt: any;
}

export default function InviteMembersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
    message: ''
  });
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const clubId = params.clubId as string;

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !clubId) return;

      try {
        setLoading(true);
        
        // Check permissions
        const canInvite = await canUserPerformAction(clubId, user.id, 'manage_members');
        if (!canInvite) {
          router.push(`/clubs/${clubId}/members`);
          return;
        }
        
        // Fetch club data
        const clubData = await getClubById(clubId);
        if (!clubData) {
          router.push('/dashboard');
          return;
        }
        
        // Fetch existing invitations
        const pendingInvitations = await getClubInvitations(clubId);
        setInvitations(pendingInvitations);
        
        setClub(clubData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, clubId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email) {
      setError('Please enter an email address');
      return;
    }
    
    try {
      setSending(true);
      
      const code = await createClubInvitation(clubId, {
        email: formData.email,
        role: formData.role as any,
        message: formData.message,
        expiresIn: 7
      });
      
      setInvitationCode(code);
      
      // Refresh invitations list
      const updatedInvitations = await getClubInvitations(clubId);
      setInvitations(updatedInvitations);
      
      // Reset form
      setFormData({
        email: '',
        role: 'member',
        message: ''
      });
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError('Failed to create invitation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const copyInvitationLink = () => {
    if (!invitationCode) return;
    
    const link = `${window.location.origin}/clubs/join?code=${invitationCode}&clubId=${clubId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'used':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/clubs/${clubId}/members`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Members
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invite Members</h1>
              <p className="text-sm text-gray-600">{club?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invitation Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send Invitation</CardTitle>
                <CardDescription>
                  Invite new members to join your club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="member@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Member Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a personal message to the invitation..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  {error && (
                    <Alert className="bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" disabled={sending} className="w-full">
                    {sending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Success Message */}
            {invitationCode && (
              <Card className="mt-4 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 mb-2">
                        Invitation sent successfully!
                      </p>
                      <p className="text-sm text-green-800 mb-3">
                        Share this invitation code: <span className="font-mono font-bold">{invitationCode}</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyInvitationLink}
                        className="bg-white"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy Invitation Link'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Pending Invitations */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Track sent invitations and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No pending invitations
                  </p>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="font-medium">{invitation.email}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>Role: {invitation.role}</span>
                            <span>Code: {invitation.code}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              Expires {new Date(invitation.expiresAt.toDate()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(invitation.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}