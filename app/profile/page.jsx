"use client"
import { useState, useEffect, useContext } from 'react';
import { UserDetailContext } from '@/context/UserDetailContext';
import { supabase } from '@/services/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Profile() {
  const { user, setUser } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    picture: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Initialize form with user data
    setProfile({
      name: user.name || '',
      email: user.email || '',
      picture: user.picture || null
    });
  }, [user, router]);

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('You must be logged in to update your profile');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error: updateError } = await supabase
        .from('Users')
        .update({
          name: profile.name
          // We don't update email as that's handled through auth system
          // And don't update picture from here as that comes from Google OAuth
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Update the context
      setUser({
        ...user,
        name: profile.name
      });
      
      setSuccess('Your profile has been updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in to view your profile</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-10">Your Profile</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center">
              {user.picture ? (
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-100">
                  <Image 
                    src={user.picture} 
                    alt="Profile" 
                    width={128} 
                    height={128} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-medium mb-4">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}
              
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              
              {user.provider && (
                <div className="mt-4 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  {user.provider === 'google' ? 'Google Account' : 'Email Account'}
                </div>
              )}
              
              {user.is_admin && (
                <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full text-xs text-blue-700 font-medium">
                  Admin
                </div>
              )}
            </div>
          </Card>
          
          <Card className="p-6 mt-6">
            <h3 className="font-medium mb-4">Account Information</h3>
            <div className="text-sm">
              <p className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </p>
              <p className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Last Sign In</span>
                <span className="font-medium">{user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'N/A'}</span>
              </p>
              <p className="flex justify-between py-2">
                <span className="text-gray-600">Account Type</span>
                <span className="font-medium">{user.is_admin ? 'Administrator' : 'Student'}</span>
              </p>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Edit Profile</h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={profile.name} 
                    onChange={(e) => setProfile({...profile, name: e.target.value})} 
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profile.email} 
                    disabled 
                    className="bg-gray-50"
                  />
                  <p className="text-xs mt-1 text-gray-500">
                    Email address cannot be changed directly. Contact support if you need to update your email.
                  </p>
                </div>
                
                {user.provider === 'google' && (
                  <div>
                    <Label htmlFor="picture">Profile Picture</Label>
                    <div className="flex items-center mt-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        {user.picture ? (
                          <Image 
                            src={user.picture} 
                            alt="Profile" 
                            width={48} 
                            height={48} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-lg font-medium">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Your profile picture is managed through your Google account</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Card>
          
          <Card className="p-6 mt-6">
            <h3 className="text-xl font-semibold mb-6">Account Security</h3>
            
            {user.provider === 'google' ? (
              <div className="bg-gray-50 p-4 rounded-md">                <p className="text-sm text-gray-600">
                  You&apos;re signed in with Google. Password management is handled through your Google account.
                </p>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => router.push('/reset-password')}>
                Change Password
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
