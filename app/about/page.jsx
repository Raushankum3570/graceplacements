"use client"

import React from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'

function page() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header Section */}
      <div className="relative mb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl transform -skew-y-2 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative px-6 py-20 text-center z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block mb-6 p-2 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm"
          >
            <span className="text-blue-600 font-medium px-4">Since 2023</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 leading-tight">
            About Grace Placement
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto px-4 leading-relaxed">
            Your trusted partner in connecting talented students with exceptional career opportunities.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex gap-4 justify-center"
          >
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all">
              Explore Opportunities
            </Button>
            <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 shadow-sm">
              Learn More
            </Button>
          </motion.div>
          
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <span className="w-8 h-1.5 bg-blue-600 rounded-full"></span>
            <span className="w-3 h-1.5 bg-blue-300 rounded-full"></span>
            <span className="w-3 h-1.5 bg-blue-300 rounded-full"></span>
          </div>
        </motion.div>
      </div>

      {/* Mission and Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-28">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-lg -z-10 blur-lg"></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-100 rounded-lg -z-10 blur-lg"></div>
          
          <div className="h-[350px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-xl relative">
            <Image 
              src="/ai.jpeg" 
              alt="Grace Placement Mission" 
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-white/90 backdrop-blur-sm text-blue-700 font-semibold py-1 px-4 rounded-full text-sm">
                Empowering Future Careers
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="space-y-10 flex flex-col justify-center"
        >
          <div>
            <div className="flex items-center mb-6">
              <span className="bg-blue-100 p-3 rounded-xl mr-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <h2 className="text-4xl font-bold text-blue-700">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed ml-16 mt-2">
              Grace Placement is dedicated to bridging the gap between academic education and professional careers. 
              We empower students to achieve their career aspirations by providing comprehensive placement and internship
              services that connect them with leading companies across the globe.
            </p>
          </div>
          
          <Separator className="w-2/3 mx-auto bg-gray-200" />
          
          <div>
            <div className="flex items-center mb-6">
              <span className="bg-indigo-100 p-3 rounded-xl mr-4 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </span>
              <h2 className="text-4xl font-bold text-indigo-700">Our Vision</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed ml-16 mt-2">
              To become the most trusted platform for career development, creating meaningful connections 
              between talented individuals and forward-thinking organizations, while fostering professional growth
              and excellence in every step of the journey.
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* What We Offer Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mb-28 relative"
      >
        <div className="absolute top-20 left-0 w-full h-[500px] bg-gradient-to-r from-blue-50 to-indigo-50 -z-10 rounded-3xl transform -rotate-1"></div>
        
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">Services</span>
          <h2 className="text-4xl font-bold mt-4">What We Offer</h2>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden group">
            <div className="h-2 bg-blue-500 w-full"></div>
            <CardHeader className="pt-8">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                  <Image src="/globe.svg" alt="Global Reach" width={64} height={64} />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Placement Services</CardTitle>
            </CardHeader>
            <CardContent className="text-center px-8">
              <p className="text-gray-600">
                We connect students with top companies for full-time positions across various industries.
                Our dedicated team works closely with employers to identify the best talent matches.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-8">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                Learn more →
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden group">
            <div className="h-2 bg-indigo-500 w-full"></div>
            <CardHeader className="pt-8">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                  <Image src="/file.svg" alt="Internship Opportunities" width={64} height={64} />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Internship Programs</CardTitle>
            </CardHeader>
            <CardContent className="text-center px-8">
              <p className="text-gray-600">
                Gain valuable industry experience through our carefully curated internship opportunities
                with leading organizations, designed to build your skills and enhance your resume.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-8">
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
                Learn more →
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden group">
            <div className="h-2 bg-purple-500 w-full"></div>
            <CardHeader className="pt-8">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
                  <Image src="/window.svg" alt="Career Development" width={64} height={64} />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Career Development</CardTitle>
            </CardHeader>
            <CardContent className="text-center px-8">
              <p className="text-gray-600">
                Access resources for resume building, interview preparation, and personalized career guidance
                to help you stand out in competitive job markets.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-8">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                Learn more →
              </Button>
            </CardFooter>
          </Card>
        </div>
      </motion.div>

      {/* Our Process */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mb-28"
      >
        <div className="text-center mb-16">
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-medium">How It Works</span>
          <h2 className="text-4xl font-bold mt-4">Our Process</h2>
          <div className="w-24 h-1.5 bg-indigo-600 mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="relative">
          {/* Process connector line */}
          <div className="hidden md:block absolute top-16 left-[calc(12.5%_+_2rem)] right-[calc(12.5%_+_2rem)] h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
              { num: "1", title: "Registration", desc: "Create your account and complete your profile", color: "blue" },
              { num: "2", title: "Assessment", desc: "Evaluate your skills and career preferences", color: "indigo" },
              { num: "3", title: "Matching", desc: "Get matched with suitable opportunities", color: "purple" },
              { num: "4", title: "Placement", desc: "Receive offers and start your career journey", color: "violet" }
            ].map((step, idx) => (
              <div key={idx} className="text-center relative">
                <div className={`bg-${step.color}-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-white z-10 relative`}>
                  <span className={`text-${step.color}-600 text-3xl font-bold`}>{step.num}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Our Team */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mb-28"
      >
        <div className="text-center mb-16">
          <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-medium">Meet The Team</span>
          <h2 className="text-4xl font-bold mt-4">Our Team</h2>
          <div className="w-24 h-1.5 bg-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>
        
        <p className="text-center text-lg mb-12 max-w-3xl mx-auto">
          Grace Placement is powered by a team of dedicated professionals with extensive experience in 
          recruitment, career counseling, and industry relations. Our team works tirelessly to create 
          meaningful connections between students and employers.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Jane Thompson", role: "Director of Placements", color: "blue" },
            { name: "Michael Chen", role: "Internship Coordinator", color: "indigo" },
            { name: "Sarah Rodriguez", role: "Career Counselor", color: "purple" }
          ].map((member, idx) => (
            <Card key={idx} className="text-center border-0 shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className={`h-2 bg-${member.color}-500 w-full`}></div>
              <CardHeader>
                <div className={`w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 bg-${member.color}-100 p-1.5`}>
                  <div className="w-full h-full rounded-full flex items-center justify-center text-gray-500 bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{member.name}</CardTitle>
                <p className={`text-${member.color}-600 font-medium`}>{member.role}</p>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="flex justify-center gap-3 mt-4">
                  {["LinkedIn", "Twitter", "Email"].map((platform, i) => (
                    <Button key={i} size="sm" variant="outline" className="rounded-full p-0 w-9 h-9">
                      <span className="sr-only">{platform}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                      </svg>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Partner Companies */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mb-28"
      >
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">Our Network</span>
          <h2 className="text-4xl font-bold mt-4">Partner Companies</h2>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="w-40 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-500 hover:shadow-lg transition-all hover:-translate-y-1">
              <span className="font-medium">Company {idx + 1}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl -translate-x-1/3 translate-y-1/2"></div>
          </div>
          
          <div className="relative p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Career Journey?</h2>
            <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
              Join Grace Placement today to access exclusive job opportunities, internships, and career resources.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <a href="/auth" className="flex items-center">
                  Sign Up Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl">
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
            
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
                <path d="M60 0L120 40H0L60 0Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default page