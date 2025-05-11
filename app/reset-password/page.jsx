"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/supabaseClient'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [hash, setHash] = useState(null)

  // Extract the hash from the URL when component mounts
  useEffect(() => {
    // The hash will be in the URL after the # symbol
    if (typeof window !== 'undefined') {
      // Look for either a hash parameter or type=recovery in the URL
      const hashParam = new URL(window.location.href).hash.replace('#', '');
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      
      if (hashParam) {
        setHash(hashParam);
        console.log('Found hash in URL');
      } else if (type === 'recovery') {
        console.log('Recovery flow detected');
      } else {
        setError('Invalid or missing reset token. Please request a new password reset link.');
      }
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setSuccess('Your password has been reset successfully!');
        // Wait a moment before redirecting to login with success message
      setTimeout(() => {
        router.push('/auth?reset=success');
      }, 2000);
      
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <div className='hidden lg:flex flex-1 bg-blue-50 items-center justify-center'>
        <div className='max-w-lg p-8'>
          <Image 
            src='/ai.jpeg' 
            alt='login' 
            width={600} 
            height={400}
            className='rounded-xl shadow-lg'
          />
          <h2 className='text-3xl font-bold mt-8 text-blue-900'>Reset Your Password</h2>
          <p className='mt-4 text-gray-600 text-lg'>
            Create a new secure password to access your Grace Placement account.
          </p>
        </div>
      </div>
      
      <div className='flex-1 flex flex-col items-center justify-center p-4 sm:p-8'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-8'>
            <Image src='/logo.svg' alt='logo' width={180} height={60} className='mx-auto' />
            <h2 className='text-2xl font-bold mt-6'>Reset Password</h2>
            <p className='text-gray-500 mt-2'>Create a new password for your account</p>
          </div>

          {error && (
            <Alert variant="destructive" className='mb-6'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className='mb-6 bg-green-50 text-green-800 border-green-200'>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card className='p-6'>
            <form onSubmit={handleResetPassword} className='space-y-4'>
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
              
              <div className="text-center mt-4">
                <a 
                  href="/auth"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Return to Sign In
                </a>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
