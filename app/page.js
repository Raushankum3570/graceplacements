"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { supabase } from '@/services/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authInitialized, setAuthInitialized] = useState(false)
  // Handle authentication code in URL after OAuth redirect
  useEffect(() => {
    const initAuth = async () => {
      // Check for the code parameter
      const code = searchParams?.get('code')
      
      if (code) {
        console.log('Auth code detected in URL:', code)
        
        try {
          // For localhost environment, we need to explicitly handle the code exchange
          // This solves the PKCE code verifier issues on localhost
          if (typeof window !== 'undefined' && 
              (window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1')) {
            
            // First clean up the URL to prevent issues with refresh
            const cleanUrl = window.location.pathname
            window.history.replaceState({}, document.title, cleanUrl)
            console.log('URL cleaned, removed code parameter')
            
            // Try to exchange the auth code directly
            try {
              // Reload the page to allow Supabase to reinitialize
              // This is a reliable method to establish the session after code processing
              setTimeout(() => {
                console.log('Reloading page to finalize auth...')
                window.location.reload()
              }, 500)
            } catch (codeExchangeError) {
              console.error('Error exchanging auth code:', codeExchangeError)
            }
          } else {
            // For production environments, use the standard flow
            const { data, error } = await supabase.auth.getSession()
            
            if (error) {
              console.error('Error getting session:', error.message)
            } else {
              console.log('Session established successfully:', data.session ? 'Yes' : 'No')
              
              // Clean up the URL
              if (typeof window !== 'undefined') {
                const cleanUrl = window.location.pathname
                window.history.replaceState({}, document.title, cleanUrl)
                console.log('URL cleaned, removed code parameter')
              }
            }
          }
        } catch (err) {
          console.error('Error during auth initialization:', err)
        }
      }
      
      setAuthInitialized(true)
    }
    
    initAuth()
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth state changed: signed in')
      } else if (event === 'SIGNED_OUT') {
        console.log('Auth state changed: signed out')
      }
    })
    
    return () => {
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [searchParams])

  return (
    <main className="min-h-screen">
      {/* Navbar is included here */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2">
                Launching Your Career
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Find Your Dream <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Placement</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                Connect with top companies and land your perfect job through Grace Placement's 
                comprehensive career platform.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20" 
                  asChild
                >
                  <Link href="/internships" className="group">
                    Browse Internships
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-blue-300 hover:border-blue-500 hover:text-blue-700 transition-all duration-300" 
                  asChild
                >
                  <Link href="/placements">View Placements</Link>
                </Button>
              </div>
              
              <div className="pt-6">
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="mr-2">Trusted by top companies including</span>
                  <span className="flex space-x-4 items-center">
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Google</span>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Microsoft</span>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Amazon</span>
                  </span>
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[300px] md:h-[450px] w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl -rotate-2 transform hover:rotate-0 transition-transform duration-300"></div>
              <div className="absolute inset-0 rounded-2xl overflow-hidden rotate-2 transform hover:rotate-0 transition-transform duration-500 shadow-xl">
                <Image 
                  src="/ai.jpeg" 
                  alt="Grace Placement" 
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-blue-100 rounded-full z-0"></div>
              <div className="absolute -top-5 -left-5 w-14 h-14 bg-indigo-100 rounded-full z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-12 bg-gradient-to-r from-gray-50 to-gray-100"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">1000+</p>
              <p className="text-gray-600">Job Listings</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">500+</p>
              <p className="text-gray-600">Partner Companies</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">10k+</p>
              <p className="text-gray-600">Successful Placements</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">95%</p>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Grace Placement</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've helped thousands of students find their perfect career path
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "/globe.svg",
                title: "Global Opportunities",
                description: "Access job openings from companies around the world with our extensive network.",
                delay: 0
              },
              {
                icon: "/file.svg",
                title: "Resume Builder",
                description: "Create and optimize your resume with our AI-powered tools to stand out.",
                delay: 0.1
              },
              {
                icon: "/window.svg",
                title: "Interview Preparation",
                description: "Practice with mock interviews and receive feedback to improve your skills.",
                delay: 0.2
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 border-gray-200">
                  <CardContent className="p-6">
                    <div className="mb-6 w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <Image src={feature.icon} alt={feature.title} width={32} height={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-center group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Create Account",
                description: "Sign up and build your profile",
                delay: 0
              },
              {
                step: 2,
                title: "Browse Opportunities",
                description: "Explore internships and placements",
                delay: 0.1
              },
              {
                step: 3,
                title: "Apply & Interview",
                description: "Submit applications and prepare",
                delay: 0.2
              },
              {
                step: 4,
                title: "Get Hired",
                description: "Receive offers and start your career",
                delay: 0.3
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: step.delay }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                    {step.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-blue-200"></div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Grace Placement helped me land my dream job at Google. Their resume builder and interview prep were game changers.",
                name: "Sarah Johnson",
                title: "Software Engineer",
                delay: 0
              },
              {
                quote: "The internship opportunities on Grace Placement were exactly what I needed to kickstart my career in marketing.",
                name: "Michael Lee",
                title: "Marketing Specialist",
                delay: 0.1
              },
              {
                quote: "I found a placement within just two weeks of signing up. The process was smooth and the team was very supportive.",
                name: "Emily Patel",
                title: "Data Analyst",
                delay: 0.2
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: testimonial.delay }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-gray-200">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4 text-yellow-400 flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 flex-grow italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center shadow-xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('/window.svg')] opacity-5"></div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-blue-500 opacity-20"></div>
            <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-indigo-500 opacity-20"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">Ready to Start Your Career Journey?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">
              Create an account today to access exclusive job listings, personalized recommendations, and career resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:shadow-lg" 
                asChild
              >
                <Link href="/auth">Sign Up Now</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white/10 transition-all duration-300" 
                asChild
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image 
                  src="/logo.svg" 
                  alt="Grace Placement Logo" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8"
                />
                <span className="font-semibold text-lg text-gray-800">
                  Grace<span className="text-blue-600">Placement</span>
                </span>
              </Link>
              <p className="text-gray-600">
                Connecting talent with opportunity. Your gateway to a successful career.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
                <li><Link href="/internships" className="text-gray-600 hover:text-blue-600">Internships</Link></li>
                <li><Link href="/placements" className="text-gray-600 hover:text-blue-600">Placements</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Resume Tips</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Interview Preparation</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Career Advice</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Skill Development</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-600">info@graceplacement.com</li>
                <li className="text-gray-600">+1 (555) 123-4567</li>
                <li className="text-gray-600">123 Placement Street, Career City</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Grace Placement. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default HomePage