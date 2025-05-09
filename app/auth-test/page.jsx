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
  // We're using email-based authentication only
  const signInWithEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUnverifiedEmail(null)
    
    try {
      console.log('Attempting to sign in with:', email)
      
      // Try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })
      
      // Handle specific error cases
      if (error) {
        console.error('Sign-in error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          setError('The email or password you entered is incorrect. Please try again.')
          return
        } else if (error.message.includes('Email not confirmed')) {
          setUnverifiedEmail(email)
          setError('Your email has not been confirmed. Please check your inbox or click the button below to resend the confirmation email.')
          return
        } else {
          setError(error.message)
          return
        }
      }
      
      // Successfully signed in
      console.log('Successfully authenticated, redirecting to homepage...')
        console.log('Sign in successful! User:', data.user)
    
      // Dispatch auth event for other components to sync
      if (typeof window !== 'undefined') {
        const authEvent = new CustomEvent('supabase-auth-update', {
          detail: { 
            action: 'signed_in', 
            source: 'auth_page',
            user: data.user,
            timestamp: new Date().getTime()
          }
        })
        window.dispatchEvent(authEvent)
        console.log('Auth event dispatched from auth page')
      }
      
      // Check if user might be an admin
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('gracecoe.org')) {
        console.log('Admin user detected, redirecting to admin dashboard')
        router.push('/admin')
      } else {
        // Redirect regular user to home page
        console.log('Redirecting to homepage')
        router.push('/')
      }
      
    } catch (err) {
      console.error('Error in sign-in process:', err)
      setError(err.message || 'An error occurred during sign-in. Please try again.')
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
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }
      
      console.log('Attempting to sign up with:', email)
      
      // Check if user might be an admin (for future reference)
      const isAdminEmail = email.toLowerCase().includes('admin') || 
                          email.toLowerCase().includes('gracecoe.org')
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name,
            is_admin: isAdminEmail // Set admin flag based on email domain
          }
        }
      })
        if (error) {
        console.error('Sign-up error:', error)
        setError(error.message)
        setLoading(false)
        return
      }
      
      // Store user in database if sign-up was successful
      if (data?.user) {
        // Check if user might be an admin (for database record)
        const isAdminEmail = email.toLowerCase().includes('admin') || 
                            email.toLowerCase().includes('gracecoe.org')
        
        console.log('Creating user record in database')
        
        const { error: dbError } = await supabase
          .from('Users')
          .insert([
            {
              email: email.toLowerCase(),
              name,
              is_admin: isAdminEmail, // Set admin flag based on email domain
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
          </div>          <div className="text-center mb-4">
            <p className="text-sm text-blue-600 font-medium mb-1">All users can sign in here</p>
            <a 
              href="/admin-auth" 
              className="text-blue-600 hover:underline text-xs"
            >
              Administrator? You can also login to the admin panel here
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
                    Don&apos;t have an account?{" "}
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
            </Tabs>            {/* Email-based authentication only */}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login