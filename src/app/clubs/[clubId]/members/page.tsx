'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  getClubById, 
  getClubMember, 
  getClubMembers,
  getMemberWithUserInfo,
  updateClubMember,
  removeClubMember,
  canUserPerformAction
} from '@/lib/services/clubService';
import { Club, ClubMember, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  UserPlus, 
  MoreVertical,
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  UserX,
  ChevronLeft
} from 'lucide-react';

interface MemberWithUser {
  member: ClubMember;
  userInfo: User;
}

export default function ClubMembersPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [canManageMembers, setCanManageMembers] = useState(false);

  const clubId = params.clubId as string;

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !clubId) return;

      try {
        setLoading(true);
        
        // Fetch club data
        const clubData = await getClubById(clubId);
        if (!clubData) {
          router.push('/dashboard');
          return;
        }
        
        // Check user permissions
        const canManage = await canUserPerformAction(clubId, user.id, 'manage_members');
        setCanManageMembers(canManage);
        
        // Fetch all members
        const clubMembers = await getClubMembers(clubId);
        
        // Fetch user info for each member
        const membersWithUsers: MemberWithUser[] = [];
        for (const member of clubMembers) {
          const memberData = await getMemberWithUserInfo(clubId, member.id);
          if (memberData) {
            membersWithUsers.push(memberData);
          }
        }
        
        setClub(clubData);
        setMembers(membersWithUsers);
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, clubId, router]);

  const handleRoleChange = async (memberId: string, newRole: ClubMember['role']) => {
    if (!canManageMembers) return;
    
    try {
      await updateClubMember(clubId, memberId, { role: newRole });
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m.member.id === memberId 
          ? { ...m, member: { ...m.member, role: newRole } }
          : m
      ));
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!canManageMembers) return;
    
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await removeClubMember(clubId, memberId);
      
      // Update local state
      setMembers(prev => prev.filter(m => m.member.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const filteredMembers = members.filter(({ member, userInfo }) => {
    const matchesSearch = 
      userInfo.profile.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userInfo.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'coach': return 'bg-green-100 text-green-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-gray-900">Members</h1>
                <p className="text-sm text-gray-600">{club?.name}</p>
              </div>
            </div>
            {canManageMembers && (
              <Button onClick={() => router.push(`/clubs/${clubId}/members/invite`)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search members by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Members ({filteredMembers.length})</CardTitle>
            <CardDescription>
              Manage your club members, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No members found matching your criteria
                </p>
              ) : (
                filteredMembers.map(({ member, userInfo }) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 bg-blue-100 text-blue-600">
                        <div className="flex items-center justify-center w-full h-full">
                          {userInfo.profile.displayName.charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {userInfo.profile.displayName}
                          </p>
                          <Badge className={getRoleColor(member.role)}>
                            <span className="flex items-center space-x-1">
                              {getRoleIcon(member.role)}
                              <span>{member.role}</span>
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {userInfo.email}
                          </span>
                          {userInfo.phone && (
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {userInfo.phone}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {canManageMembers && member.role !== 'owner' && (
                      <div className="flex items-center space-x-2">
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member.id, value as ClubMember['role'])}
                          disabled={member.userId === user?.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="coach">Coach</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                        {member.userId !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}