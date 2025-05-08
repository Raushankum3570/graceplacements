'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/services/supabaseClient'
import { useUser } from '../provider'
import { isAdmin } from '@/lib/admin'

// This page manages internship listings with real-time database integration
// When updates or deletes are performed, they directly modify the Supabase database
// - Updates: Change records in the database immediately
// - Deletes: Permanently remove records from the database

export default function InternshipsPage() {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [buttonPressed, setButtonPressed] = useState(null)
  const { user } = useUser()
  const userIsAdmin = user ? isAdmin(user) : false

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    location: '',
    description: '',
    salary: '',
    application_deadline: '',
    requirements: '',
    link: ''
  })

  // Load internships data
  useEffect(() => {
    fetchInternships()
  }, [])

  async function fetchInternships() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInternships(data || [])
    } catch (error) {
      console.error('Error fetching internships:', error)
      setError('Failed to fetch internships. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Button click handler with visual feedback
  function handleButtonClick(id, callback) {
    setButtonPressed(id)

    // Add visual feedback for 200ms
    setTimeout(() => {
      setButtonPressed(null)
      if (callback) callback()
    }, 200)
  }

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  function resetForm() {
    setFormData({
      company_name: '',
      position: '',
      location: '',
      description: '',
      salary: '',
      application_deadline: '',
      requirements: '',
      link: ''
    })
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      // Make sure we have all required fields
      if (!formData.company_name || !formData.position) {
        setError('Company name and position are required')
        setLoading(false)
        return
      }

      console.log('Saving internship data:', formData)

      if (editingId) {
        // Update existing record
        const { error } = await supabase
          .from('internships')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
        console.log('Successfully updated internship:', formData.company_name, formData.position)
      } else {
        // Create new record
        const { error, data } = await supabase
          .from('internships')
          .insert([formData])
          .select()

        if (error) throw error
        console.log('Successfully added new internship:', data)
      }

      // Refresh data and reset form
      await fetchInternships()
      resetForm()
      setIsFormVisible(false)
    } catch (error) {
      console.error('Error saving internship:', error)
      setError(`Failed to save internship: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(internship) {
    setFormData({
      company_name: internship.company_name || '',
      position: internship.position || '',
      location: internship.location || '',
      description: internship.description || '',
      salary: internship.salary || '',
      application_deadline: internship.application_deadline || '',
      requirements: internship.requirements || '',
      link: internship.link || ''
    })
    setEditingId(internship.id)
    setIsFormVisible(true)
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this internship?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('internships')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh data
      fetchInternships()
    } catch (error) {
      console.error('Error deleting internship:', error)
      setError('Failed to delete internship. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Internship Opportunities</h1>
        {userIsAdmin && (
          <Button
            className={`bg-green-600 hover:bg-green-700 text-white ${buttonPressed === 'add' ? 'opacity-50' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleButtonClick('add', () => {
                resetForm()
                setIsFormVisible(!isFormVisible)
              })
            }}
          >
            {isFormVisible ? 'Cancel' : 'Add Internship'}
            {!isFormVisible && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 ml-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <Button variant="link" className="ml-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Internship Form */}
      {isFormVisible && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Internship' : 'Add New Internship'}</CardTitle>
            <CardDescription>Enter the internship details below</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company_name" className="block mb-2 text-sm font-medium">
                    Company Name
                  </label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block mb-2 text-sm font-medium">
                    Position
                  </label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block mb-2 text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="salary" className="block mb-2 text-sm font-medium">
                    Salary/Stipend
                  </label>
                  <Input
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="application_deadline" className="block mb-2 text-sm font-medium">
                  Application Deadline
                </label>
                <Input
                  id="application_deadline"
                  name="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block mb-2 text-sm font-medium">
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label htmlFor="link" className="block mb-2 text-sm font-medium">
                  Application Link
                </label>
                <Input
                  id="link"
                  name="link"
                  type="url"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/apply"
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Saving...' : editingId ? 'Update Internship' : 'Add Internship'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation()
                  resetForm()
                  setIsFormVisible(false)
                }}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Internships List */}
      {loading && !isFormVisible ? (
        <div className="text-center py-10">Loading internships...</div>
      ) : internships.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl">No internships found.</p>
          {userIsAdmin && (
            <p className="text-muted-foreground">Click 'Add Internship' to create your first listing.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {internships.map((internship) => (
            <Card key={internship.id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{internship.position}</CardTitle>
                    <CardDescription className="mt-1">{internship.company_name}</CardDescription>
                  </div>
                  {userIsAdmin && (
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className={`h-8 w-8 rounded-full ${buttonPressed === internship.id ? 'opacity-50' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleButtonClick(internship.id, () => handleEdit(internship))
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className={`h-8 w-8 rounded-full text-red-500 hover:bg-red-50 ${buttonPressed === internship.id ? 'opacity-50' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleButtonClick(internship.id, () => handleDelete(internship.id))
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-3 flex items-start space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mt-0.5 shrink-0 text-gray-500"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                  <span>{internship.location || 'Remote'}</span>
                </div>

                {internship.salary && (
                  <div className="mb-3 flex items-start space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mt-0.5 shrink-0 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <span>{internship.salary}</span>
                  </div>
                )}

                {internship.application_deadline && (
                  <div className="mb-3 flex items-start space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mt-0.5 shrink-0 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 18 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5"
                      />
                    </svg>
                    <span>Apply by: {new Date(internship.application_deadline).toLocaleDateString()}</span>
                  </div>
                )}

                {internship.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-1">Description</h3>
                    <p className="text-sm line-clamp-3">{internship.description}</p>
                  </div>
                )}

                {internship.requirements && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-1">Requirements</h3>
                    <p className="text-sm line-clamp-2">{internship.requirements}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {internship.link ? (
                  <Button
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${buttonPressed === internship.id ? 'opacity-50' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleButtonClick(internship.id, () => window.open(internship.link, '_blank'))
                    }}
                  >
                    Apply Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 ml-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </Button>
                ) : (
                  <Button variant="secondary" className="w-full opacity-70" disabled>
                    No Application Link
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}