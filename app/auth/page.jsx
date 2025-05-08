"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/supabaseClient'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'

function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState("signin")
  const [unverifiedEmail, setUnverifiedEmail] = useState(null)

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      // Determine the redirect URL based on environment
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const redirectTo = isLocalhost 
        ? 'http://127.0.0.1:3000/' // Use 127.0.0.1 instead of localhost
        : `${window.location.origin}/`;
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      })
      if (error) throw error
      
      // Google OAuth will handle redirection automatically
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const signInWithEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUnverifiedEmail(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('The email or password you entered is incorrect. Please try again.')
        } else if (error.message === 'Email not confirmed') {
          setUnverifiedEmail(email)
          throw new Error('Your email has not been confirmed. Please check your inbox or click the button below to resend the confirmation email.')
        } else {
          throw error
        }
      }
      
      // Successfully signed in
      console.log('Successfully authenticated, redirecting to homepage...')
      
      // Force a delay to ensure authentication state is properly updated
      setTimeout(() => {
        router.push('/')
      }, 100)
      
    } catch (err) {
      console.error('Error signing in with email:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationEmail = async () => {
    if (!unverifiedEmail) return
    
    setResendLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail
      })
      if (error) throw error
      setSuccess(`Verification email resent to ${unverifiedEmail}. Please check your inbox.`)
    } catch (err) {
      console.error('Error resending verification email:', err)
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  const signUpWithEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            is_admin: false
          }
        }
      })
      
      if (error) throw error
      
      if (data?.user) {
        const { error: dbError } = await supabase
          .from('Users')
          .insert([
            {
              email: email.toLowerCase(),
              name,
              is_admin: false,
              created_at: new Date().toISOString()
            }
          ])
        
        if (dbError) {
          console.error('Error storing user data:', dbError)
        }
      }
      
      setSuccess('Registration successful! Please check your email to verify your account.')
      
      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      console.error('Error signing up:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const switchToSignUp = () => {
    setActiveTab("signup")
    setError(null)
    setSuccess(null)
    setUnverifiedEmail(null)
  }

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
          <h2 className='text-3xl font-bold mt-8 text-blue-900'>Shape Your Future Career</h2>
          <p className='mt-4 text-gray-600 text-lg'>
            Grace Placement Management System helps you connect with leading companies
            and manage your entire placement journey in one place.
          </p>
        </div>
      </div>
      
      <div className='flex-1 flex flex-col items-center justify-center p-4 sm:p-8'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-8'>
            <Image src='/logo.svg' alt='logo' width={180} height={60} className='mx-auto' />
            <h2 className='text-2xl font-bold mt-6'>Welcome to Grace PMS</h2>
            <p className='text-gray-500 mt-2'>Your gateway to career opportunities</p>
          </div>

          <div className="text-center mb-4">
            <a 
              href="/admin-auth" 
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Administrator? Login to admin panel here
            </a>
          </div>

          {error && (
            <Alert variant="destructive" className='mb-6'>
              <AlertDescription>
                {error}
                {unverifiedEmail && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resendVerificationEmail}
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Sending...' : 'Resend verification email'}
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className='mb-6 bg-green-50 text-green-800 border-green-200'>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card className='p-6'>
            <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={signInWithEmail} className='space-y-4'>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <div className="text-right text-sm mt-1">
                      <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <p className="text-sm text-center text-gray-500 mt-4">
                    Don't have an account?{" "}
                    <button 
                      type="button"
                      onClick={switchToSignUp} 
                      className="text-blue-600 hover:underline"
                    >
                      Create one now
                    </button>
                  </p>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={signUpWithEmail} className='space-y-4'>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
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
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className='mt-6'>
              <div className='relative'>
                <Separator />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='bg-white px-2 text-gray-500 text-sm'>OR</span>
                </div>
              </div>
              
              <Button 
                onClick={signInWithGoogle} 
                variant="outline" 
                className='mt-6 w-full flex items-center justify-center gap-2'
                disabled={loading}
              >
                <Image src='/Google.png' alt='Google' width={20} height={20} />
                Continue with Google
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login