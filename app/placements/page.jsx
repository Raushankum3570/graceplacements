'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/services/supabaseClient'
import { useUser } from '../provider'
import { isAdmin } from '@/lib/admin'

// This page manages student placement records with real-time database integration
// When users update or delete records, changes are immediately synchronized with Supabase:
// - Updates: When you edit a placement record, changes are permanently saved to the database
// - Deletes: When you delete a record, it is permanently removed from the database after confirmation

export default function PlacementsPage() {
  const [placements, setPlacements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useUser()
  const userIsAdmin = user ? isAdmin(user) : false
  
  // Form state
  const [formData, setFormData] = useState({
    student_name: '',
    company_name: '',
    position: '',
    package: '',
    placement_date: '',
    location: '',
    description: '',
    batch: '',
    branch: ''
  })

  // Load placements data
  useEffect(() => {
    fetchPlacements()
  }, [])

  async function fetchPlacements() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('placements')
        .select('*')
        .order('placement_date', { ascending: false })
      
      if (error) throw error
      setPlacements(data || [])
    } catch (error) {
      console.error('Error fetching placements:', error)
      setError('Failed to fetch placements. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  function resetForm() {
    setFormData({
     
      company_name: '',
      position: '',
      package: '',
      placement_date: '',
      location: '',
      description: '',
      batch: '',
      branch: ''
    })
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (editingId) {
        // Update existing record
        const { error } = await supabase
          .from('placements')
          .update(formData)
          .eq('id', editingId)
        
        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('placements')
          .insert(formData)
        
        if (error) throw error
      }
      
      // Refresh data and reset form
      fetchPlacements()
      resetForm()
      setIsFormVisible(false)
    } catch (error) {
      console.error('Error saving placement:', error)
      setError('Failed to save placement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(placement) {
    setFormData({
      
      company_name: placement.company_name || '',
      position: placement.position || '',
      package: placement.package || '',
      placement_date: placement.placement_date || '',
      location: placement.location || '',
      description: placement.description || '',
      batch: placement.batch || '',
      branch: placement.branch || ''
    })
    setEditingId(placement.id)
    setIsFormVisible(true)
    
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this placement record?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('placements')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Refresh data
      fetchPlacements()
    } catch (error) {
      console.error('Error deleting placement:', error)
      setError('Failed to delete placement. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Filter placements based on search query and active tab
  const filteredPlacements = placements.filter(placement => {
    const matchesSearch = searchQuery === '' || 
      placement.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      placement.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      placement.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      placement.branch?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'highpackage') return matchesSearch && parseFloat(placement.package) >= 10
    if (activeTab === 'recent') {
      const placementDate = new Date(placement.placement_date)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      return matchesSearch && placementDate >= threeMonthsAgo
    }
    
    return matchesSearch
  })
  
  // Calculate stats
  const totalPlacements = placements.length
  const avgPackage = placements.length > 0 
    ? (placements.reduce((sum, p) => sum + (parseFloat(p.package) || 0), 0) / placements.length).toFixed(2)
    : 0
  const uniqueCompanies = new Set(placements.map(p => p.company_name)).size

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white mb-8 p-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Student Placements</h1>
              <p className="text-blue-100 max-w-xl">
                Browse student placement records and celebrate career success stories.
              </p>
            </div>
            {userIsAdmin && (
              <Button 
                className="mt-4 md:mt-0 bg-white text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  resetForm()
                  setIsFormVisible(!isFormVisible)
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {isFormVisible ? 'Cancel' : 'Add New Placement'}
              </Button>
            )}
          </div>
          
          {/* Stats cards */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-100">Total Placements</h3>
                <p className="text-2xl font-bold">{totalPlacements}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-100">Average Package</h3>
                <p className="text-2xl font-bold">{avgPackage} LPA</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-100">Companies</h3>
                <p className="text-2xl font-bold">{uniqueCompanies}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
            <Button variant="ghost" className="ml-auto text-red-700 hover:text-red-800" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Placement Form */}
      {isFormVisible && userIsAdmin && (
        <Card className="mb-8 border border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle>{editingId ? 'Edit Placement' : 'Add New Placement'}</CardTitle>
            <CardDescription>Enter the placement details below</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="student_name" className="text-sm font-medium">
                    Student Name
                  </label>
                  <Input
                    id="student_name"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter student name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="company_name" className="text-sm font-medium">
                    Company Name
                  </label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="position" className="text-sm font-medium">
                    Position
                  </label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. Software Engineer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="package" className="text-sm font-medium">
                    Package (LPA)
                  </label>
                  <Input
                    id="package"
                    name="package"
                    type="text"
                    value={formData.package}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. 12.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="placement_date" className="text-sm font-medium">
                    Placement Date
                  </label>
                  <Input
                    id="placement_date"
                    name="placement_date"
                    type="date"
                    value={formData.placement_date}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. Bangalore, India"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="batch" className="text-sm font-medium">
                    Batch Year
                  </label>
                  <Input
                    id="batch"
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. 2024-25"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="branch" className="text-sm font-medium">
                    Branch/Department
                  </label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. Computer Science"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description/Comments
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional details about this placement"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-gray-50 px-6 py-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm()
                  setIsFormVisible(false)
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <><span className="mr-2 inline-block w-4 h-4 border-2 border-white/20 border-t-white/100 rounded-full animate-spin"></span>Saving...</>
                ) : editingId ? 'Update Placement' : 'Add Placement'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {/* Search and filter */}
      {!loading && placements.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
            <div className="relative w-full sm:w-72">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <Input
                type="text"
                placeholder="Search placements..."
                className="w-full pl-9 focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="all" className="w-full sm:w-auto" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="highpackage">High Package</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Separator />
        </div>
      )}

      {/* Placements List */}
      {loading && !isFormVisible ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading placements...</p>
        </div>
      ) : placements.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">No placements found</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            {userIsAdmin 
              ? "Start by adding placement records for students to showcase their career achievements."
              : "No placement records are available at the moment. Check back later!"}
          </p>
          {userIsAdmin && (
            <Button 
              onClick={() => setIsFormVisible(true)} 
              className="mt-5"
            >
              Add Your First Placement
            </Button>
          )}
        </div>
      ) : filteredPlacements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No matching placements</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter to find what you&apos;re looking for</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('')
              setActiveTab('all')
            }} 
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlacements.map(placement => (
            <Card 
              key={placement.id} 
              className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <CardHeader className="relative pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold line-clamp-1">{placement.student_name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{placement.company_name}</span>
                    </CardDescription>
                  </div>
                  {userIsAdmin && (
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(placement)}
                        className="p-1 h-8 w-8 rounded-full hover:bg-blue-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(placement.id)}
                        className="p-1 h-8 w-8 rounded-full hover:bg-red-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">{placement.position}</div>
              </CardHeader>
              
              <CardContent className="flex-1 pt-2">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {placement.package && (
                      <div className="col-span-1">
                        <div className="text-gray-500">Package</div>
                        <div className="font-semibold">{placement.package} LPA</div>
                      </div>
                    )}
                    
                    {placement.location && (
                      <div className="col-span-1">
                        <div className="text-gray-500">Location</div>
                        <div className="font-semibold">{placement.location}</div>
                      </div>
                    )}
                    
                    {placement.placement_date && (
                      <div className="col-span-2">
                        <div className="text-gray-500">Date</div>
                        <div className="font-semibold">{new Date(placement.placement_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {placement.batch && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Batch {placement.batch}
                    </span>
                  )}
                  {placement.branch && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {placement.branch}
                    </span>
                  )}
                </div>

                {placement.description && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-1 text-gray-600">Comments</h3>
                    <p className="text-sm line-clamp-3 text-gray-700">{placement.description}</p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="mt-auto border-t pt-3">
                <div className="flex items-center justify-center w-full gap-1 text-sm text-blue-600 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Successfully Placed
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}