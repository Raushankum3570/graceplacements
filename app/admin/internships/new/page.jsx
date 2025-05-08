"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/provider';
import { useAdminProtection } from '@/lib/admin';
import { supabase } from '@/services/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function NewInternship() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    duration: '',
    stipend: '',
    description: '',
    requirements: '',
    apply_link: '',
    deadline: '',
    positions: '',
    remote: false
  });
  
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use admin protection hook to handle unauthorized access
  const isAuthorized = useAdminProtection(router, user, isLoading);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Check if Internships table exists first
      const { error: tableError } = await supabase
        .from('Internships')
        .select('count', { count: 'exact', head: true });
      
      if (tableError) {
        if (tableError.code === 'PGRST116') {
          // Table does not exist, let's create it
          await supabase.rpc('create_internships_table_if_not_exists');
        } else {
          throw tableError;
        }
      }
      
      // Now insert the internship data
      const { data, error } = await supabase
        .from('Internships')
        .insert([
          {
            ...formData,
            created_by: user?.id,
            created_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      // Success, redirect back to admin dashboard
      router.push('/admin?tab=internships');
      
    } catch (error) {
      console.error('Error creating internship:', error);
      setSubmitError(error.message || 'Failed to create internship');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state while checking authorization
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If not authorized, the redirect is handled by the hook
  // This is a fallback
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Internship</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      
      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Internship Details</CardTitle>
            <CardDescription>
              Fill out the form below to create a new internship opportunity.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Internship Title*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Frontend Developer Intern"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company*</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g., Tech Solutions Inc."
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Bengaluru, Karnataka"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration*</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 3 months"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stipend">Stipend</Label>
                <Input
                  id="stipend"
                  name="stipend"
                  value={formData.stipend}
                  onChange={handleChange}
                  placeholder="e.g., ₹15,000 per month"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="positions">Available Positions</Label>
                <Input
                  id="positions"
                  name="positions"
                  type="number"
                  value={formData.positions}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline min-h-[100px]"
                placeholder="Detailed description of the internship..."
                required
              ></textarea>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline min-h-[100px]"
                placeholder="Skills or qualifications required..."
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apply_link">Application Link*</Label>
                <Input
                  id="apply_link"
                  name="apply_link"
                  value={formData.apply_link}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline*</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remote"
                name="remote"
                checked={formData.remote}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <Label htmlFor="remote">Remote work available</Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Internship'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}