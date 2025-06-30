'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  getClubById,
  canUserPerformAction,
  generateInvitationCode
} from '@/lib/services/clubService';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Club } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft,
  Link,
  Copy,
  Calendar,
  Users,
  CheckCircle,
  QrCode,
  Mail,
  MessageCircle,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

export default function BulkInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationLink, setRegistrationLink] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [memberLimit, setMemberLimit] = useState(100);

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
        
        setClub(clubData);
        
        // Generate registration link
        const code = generateInvitationCode();
        setLinkCode(code);
        setRegistrationLink(`${window.location.origin}/join/${code}`);
        
        // Store the bulk invitation in Firebase
        const invitationRef = doc(collection(db, 'clubs', clubId, 'invitations'), code);
        await setDoc(invitationRef, {
          code,
          type: 'bulk',
          status: 'active',
          memberLimit,
          usedCount: 0,
          createdAt: new Date(),
          createdBy: user.id,
          expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to generate registration link');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, clubId, router]);

  const copyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = `Join ${club?.name}! Register as a member using this link: ${registrationLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Invitation to join ${club?.name}`;
    const body = `Hello,\n\nYou're invited to join ${club?.name} as a member.\n\nPlease use the following link to complete your registration:\n${registrationLink}\n\nThis link will expire in ${expiryDays} days.\n\nBest regards,\n${club?.name} Management`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating registration link...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Bulk Member Registration</h1>
              <p className="text-sm text-gray-600">{club?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Alert */}
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Registration link generated successfully! Share this link with your members to allow them to self-register.
          </AlertDescription>
        </Alert>

        {/* Registration Link Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Registration Link
            </CardTitle>
            <CardDescription>
              Share this link with your members. They can use it to create their own accounts and join {club?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Registration URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={registrationLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={copyLink}
                    variant={copied ? "default" : "outline"}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Registration Code</Label>
                  <p className="text-2xl font-mono font-bold mt-1">{linkCode}</p>
                </div>
                <div>
                  <Label>Expires In</Label>
                  <p className="text-lg font-medium mt-1">{expiryDays} days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sharing Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Registration Link
            </CardTitle>
            <CardDescription>
              Choose how you want to share the registration link with your members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={shareViaWhatsApp}
              >
                <MessageCircle className="h-8 w-8 text-green-600" />
                <span>Share via WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={shareViaEmail}
              >
                <Mail className="h-8 w-8 text-blue-600" />
                <span>Share via Email</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => toast.info('QR code generation coming soon!')}
              >
                <QrCode className="h-8 w-8 text-purple-600" />
                <span>Generate QR Code</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Simple steps for your members to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium">Share the link</p>
                  <p className="text-sm text-gray-600">Send the registration link to your members via WhatsApp, email, or social media</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">Members fill the form</p>
                  <p className="text-sm text-gray-600">They'll enter their personal details, emergency contacts, and create a password</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium">Automatic registration</p>
                  <p className="text-sm text-gray-600">Members are automatically added to your club and can start using the system</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> You can create multiple registration links for different member groups or events
          </p>
        </div>
      </div>
    </div>
  );
}