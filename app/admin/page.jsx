"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../provider';
import { useAdminProtection } from '@/lib/admin';
import { supabase } from '@/services/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInternships: 0,
    totalPlacements: 0,
    totalCompanies: 0,
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Use admin protection hook to handle unauthorized access
  const isAuthorized = useAdminProtection(router, user, isLoading);

  useEffect(() => {
    if (isAuthorized) {
      fetchStats();
    }
  }, [isAuthorized]);

  const fetchStats = async () => {
    try {
      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from('Users')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;

      // For demonstration - you would replace these with actual table names
      const tables = {
        internships: 'Internships',
        placements: 'Placements',
        companies: 'Companies'
      };
      
      const counts = { totalUsers: userCount || 0 };
      
      // Fetch counts for other tables if they exist
      for (const [key, table] of Object.entries(tables)) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            counts[`total${key.charAt(0).toUpperCase() + key.slice(1)}`] = count || 0;
          }
        } catch (err) {
          console.log(`Table ${table} might not exist yet`);
        }
      }
      
      setStats(counts);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Failed to load admin statistics');
    }
  };

  // Show loading state while checking authorization
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading admin dashboard...</div>;
  }
  
  // If not authorized, the redirect is handled by the hook
  // This is a fallback
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="internships">Internships</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Overview Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              description="Registered users" 
              onClick={() => setActiveTab('users')} 
            />
            <StatCard 
              title="Internships" 
              value={stats.totalInternships} 
              description="Available internships" 
              onClick={() => setActiveTab('internships')} 
            />
            <StatCard 
              title="Placements" 
              value={stats.totalPlacements} 
              description="Placement opportunities" 
              onClick={() => setActiveTab('placements')} 
            />
            <StatCard 
              title="Companies" 
              value={stats.totalCompanies} 
              description="Partner companies" 
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={() => router.push('/admin/internships/new')}>
                Add New Internship
              </Button>
              <Button onClick={() => router.push('/admin/placements/new')}>
                Add New Placement
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/users')}>
                Manage Users
              </Button>
              <Button variant="outline" onClick={() => fetchStats()}>
                Refresh Statistics
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Users with administrative access</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>admin@gracecoe.org</li>
                <li>principal@gracecoe.org</li>
                <li>placement.officer@gracecoe.org</li>
                <li>dean@gracecoe.org</li>
                <li>tech.admin@gracecoe.org</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        {/* Internships Management Tab */}
        <TabsContent value="internships" className="space-y-6">
          <InternshipManagement />
        </TabsContent>
        
        {/* Placements Management Tab */}
        <TabsContent value="placements" className="space-y-6">
          <PlacementManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, description, onClick }) {
  return (
    <Card className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} onClick={onClick}>
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium">{title}</h3>
      </CardContent>
    </Card>
  );
}

// Placeholder component for User Management
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('Users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage registered users</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Joined</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <Button variant="outline" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Placeholder component for Internship Management
function InternshipManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Internship Management</CardTitle>
        <CardDescription>Manage internship opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          This section will allow you to add, edit, and delete internship listings.
        </p>
        <div className="mt-4">
          <Button>Add New Internship</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholder component for Placement Management
function PlacementManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Placement Management</CardTitle>
        <CardDescription>Manage placement opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          This section will allow you to add, edit, and delete placement listings.
        </p>
        <div className="mt-4">
          <Button>Add New Placement</Button>
        </div>
      </CardContent>
    </Card>
  );
}