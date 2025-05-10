"use client"
import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserDetailContext } from '@/context/UserDetailContext';
import { supabase } from '@/services/supabaseClient';
import { getSessionAndUser } from './NavbarAuth';

export default function Navbar() {  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, setUser } = useContext(UserDetailContext);
  const router = useRouter();

  // Handle protected navigation - only signed-in users can access certain pages
  const handleProtectedNavigation = (e, href) => {
    // Allow navigation to home page regardless of auth status
    if (href === '/') return true;
    
    // For other protected routes, prevent default navigation if not signed in
    if (!user && (href === '/internships' || href === '/placements' || href === '/about' || href === '/contact')) {
      e.preventDefault();
      router.push('/auth');
      return false;
    }
    
    return true;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('#profile-dropdown')) {
        setIsProfileMenuOpen(false);
      }
    };    // Listen for custom auth update events
    const handleAuthUpdate = (event) => {
      console.log('Navbar received auth update event', event.detail);
      // Use our helper to safely refresh session data
      const refreshUserSession = async () => {
        try {
          const { user: fetchedUser } = await getSessionAndUser();
          
          if (fetchedUser) {
            console.log('Navbar refreshed user data successfully');
            
            // Check if the user is an admin and redirect if necessary
            if (fetchedUser.is_admin) {
              console.log('Admin user detected in navbar');
              // If on regular auth page, redirect to admin
              if (pathname === '/auth') {
                router.push('/admin');
                return;
              }
            } else {
              // Regular user - if on admin pages, redirect to home
              if (pathname.startsWith('/admin')) {
                console.log('Regular user on admin page, redirecting to home');
                router.push('/');
                return;
              }
            }
            
            setUser(fetchedUser);
          } else {
            console.log('No user found in session, clearing user context');
            setUser(null);
            
            // If on protected page and no user, redirect to auth
            if (pathname.startsWith('/admin') || pathname === '/internships' || 
                pathname === '/placements' || pathname === '/about' || pathname === '/contact') {
              router.push('/auth');
            }
          }
        } catch (err) {
          console.error('Safe error handling in Navbar refresh:', err);
          // Don't clear user on error to prevent flickering if it's just a temporary issue
        }
      };
      refreshUserSession();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('supabase-auth-update', handleAuthUpdate);
      return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('supabase-auth-update', handleAuthUpdate);
    };
  }, [isProfileMenuOpen, pathname, router, setUser]);
  
  // Initialize auth state and setup direct auth listener
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Use the safer helper function to get session and user
        const { user: fetchedUser } = await getSessionAndUser();
        
        if (fetchedUser) {
          console.log('Navbar detected active session on init');
          
          // Only update if we don't have a user or if the email has changed
          if (!user || user.email !== fetchedUser.email) {
            console.log('Setting user in navbar:', fetchedUser.name || fetchedUser.email);
            setUser(fetchedUser);
          }
        }
      } catch (error) {
        console.error('Error in safe auth check:', error.message);
        // Don't clear user on error
      }
    };
    
    checkAuthState();
      // Set up an auth subscription directly in the navbar
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log('Navbar detected sign-in directly');
          await checkAuthState();
          
          // If we're on the auth page, redirect to home
          if (typeof window !== 'undefined' && pathname === '/auth') {
            console.log('Navbar redirecting from auth page to home');
            router.push('/');
          }
        }
      }
    );
      return () => {
      if (authSubscription?.subscription?.unsubscribe) {
        authSubscription.subscription.unsubscribe();
      }
    };
  }, [user, setUser, pathname, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Close dropdown
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-1' : 'bg-white/90 py-2'
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="relative group">
                <Image 
                  src="/logo.svg" 
                  alt="Grace Placement Logo" 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-blue-500/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
              <span className="font-semibold text-lg text-gray-800">
                Grace<span className="text-blue-600 font-bold">Placement</span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center space-x-8"
          >
            {[
              { href: '/', label: 'Home' },
              { href: '/internships', label: 'Internships' },
              { href: '/placements', label: 'Placements' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' }
            ].map(({ href, label }) => (
              <Link 
                key={href}
                href={href} 
                className="relative group"
                onClick={(e) => handleProtectedNavigation(e, href)}
              >
                <span className={`transition-colors ${
                  pathname === href ? 'text-blue-600 font-medium' : 'text-gray-700 group-hover:text-blue-600'
                }`}>
                  {label}
                </span>
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500 transform origin-left scale-x-0 transition-transform duration-300 ${
                  pathname === href ? 'scale-x-100' : 'group-hover:scale-x-100'
                }`}></span>
              </Link>
            ))}
          </motion.div>

          {/* Auth Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-3"
          >
            {!user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:shadow-sm"
                >
                  <Link href="/auth">Log In</Link>
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:shadow-md"
                >
                  <Link href="/auth">Sign Up</Link>
                </Button>
              </>
            ) : (
              <div className="relative" id="profile-dropdown">                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 rounded-full bg-blue-50 p-1 px-3 hover:bg-blue-100 transition-colors border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                >
                  {user.picture ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image 
                        src={user.picture} 
                        alt="Profile" 
                        width={32} 
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="font-medium text-sm text-gray-700 pr-1">
                    {user.name || (user.email ? user.email.split('@')[0] : "User")}
                  </span>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Signed in as <span className="font-medium text-blue-600">{user.email}</span>
                      </div>
                        {(user.is_admin || user.is_admin_computed) && (
                        <Link 
                          href="/admin" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      
                      
                      
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:hidden flex items-center"
          >
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md focus:outline-none text-gray-800 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden"
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-white/95 backdrop-blur-sm shadow-lg">
          {[
            { href: '/', label: 'Home' },
            { href: '/internships', label: 'Internships' },
            { href: '/placements', label: 'Placements' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' }
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${
                pathname === href 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'hover:bg-gray-50 hover:text-blue-600'
              }`}
              onClick={(e) => {
                handleProtectedNavigation(e, href);
                setIsMobileMenuOpen(false);
              }}
            >
              {label}
              {pathname === href && (
                <svg className="ml-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </Link>
          ))}
          
          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-gray-200">
            {!user ? (
              <>
                <Button variant="outline" size="sm" className="w-full justify-center hover:border-blue-500" asChild>
                  <Link href="/auth">Log In</Link>
                </Button>
                <Button size="sm" className="w-full justify-center bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/auth">Sign Up</Link>
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="font-medium text-sm text-gray-700">
                    {user.email ? user.email.split('@')[0] : "User"}
                  </span>
                </div>
                  {(user.is_admin || user.is_admin_computed) && (
                  <Link 
                    href="/admin" 
                    className="flex items-center px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Admin Dashboard
                  </Link>
                )}

                <Link 
                  href="#"
                  className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Profile Settings
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 rounded-md text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Sign Out
                </button>
              </>
            )}
          </div>      </div>
      </motion.div>
    </nav>
  );
}