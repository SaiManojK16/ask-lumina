'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { isSuperAdmin } from '@/utils/roles';
import { ROLES } from '@/utils/roles';
import { createPortal } from 'react-dom';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [regularUsers, setRegularUsers] = useState([]);
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        const admins = data.users.filter(user => user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN);
        const regular = data.users.filter(user => user.role === ROLES.USER);
        setUsers(admins);
        setRegularUsers(regular);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      setUpdateStatus('Updating...');
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Update local state
      if (newRole === ROLES.ADMIN) {
        // If promoting to admin, remove from regularUsers and add to users
        const promotedUser = regularUsers.find(u => u.id === userId);
        if (promotedUser) {
          setRegularUsers(regularUsers.filter(u => u.id !== userId));
          setUsers([...users, { ...promotedUser, role: newRole }]);
        }
      }

      setUpdateStatus('Updated successfully!');
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (err) {
      setError(err.message);
      setUpdateStatus('Update failed');
      setTimeout(() => setUpdateStatus(''), 3000);
    }
  };

  // Remove admin
  const removeAdmin = async (userId) => {
    try {
      setUpdateStatus('Updating...');
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: ROLES.USER })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // Update local state
      // Remove from admins list
      setUsers(users.filter(user => user.id !== userId));
      // Add to regular users
      const removedUser = users.find(u => u.id === userId);
      if (removedUser) {
        setRegularUsers([...regularUsers, { ...removedUser, role: ROLES.USER }]);
      }

      setUpdateStatus('Updated successfully!');
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (err) {
      setError(err.message);
      setUpdateStatus('Update failed');
      setTimeout(() => setUpdateStatus(''), 3000);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <div className="relative z-50">
        <Header />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-light/10 via-transparent to-transparent dark:from-accent-dark/10 dark:via-transparent dark:to-transparent"></div>
      
      <main className="relative max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push('/admin')}
          className="group mb-6 inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-accent-light dark:hover:text-accent-dark transition-colors"
        >
          <FaArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Admin
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded-lg hover:bg-accent-light/20 dark:hover:bg-accent-dark/20 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Admin
          </button>
        </div>

        {updateStatus && (
          <div className={`mb-6 p-4 rounded-lg backdrop-blur-sm ${updateStatus.includes('failed') 
            ? 'bg-red-500/10 text-red-500 dark:text-red-400' 
            : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
            {updateStatus}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-light/20 border-t-accent-light"></div>
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-gray-800/90 shadow-sm rounded-xl overflow-hidden ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] backdrop-blur-sm">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-br from-accent-light/[0.07] to-transparent dark:from-accent-dark/[0.07] dark:to-transparent">
              <h2 className="text-base font-medium text-gray-900 dark:text-white">
                Admins & Super Admins ({users.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <div key={user.id} className="group hover:bg-accent-light/[0.02] dark:hover:bg-accent-dark/[0.02] transition-colors">
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
                        {user.name || 'Unnamed User'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded">
                          {user.role}
                        </span>
                        {isSuperAdmin(user) && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeAdmin(user.id)}
                      className="ml-4 inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 dark:bg-red-400/10 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Remove Admin"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Admin Modal */}
      {mounted && showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Admin</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select User
                </label>
                <div className="relative">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full py-2 pl-3 pr-8 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:border-transparent appearance-none transition-colors"
                  >
                    <option value="">Select a user</option>
                    {regularUsers.map(user => (
                      <option key={user.id} value={user.id} className="text-gray-900 dark:text-white">
                        {user.email}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedUser) {
                      updateUserRole(selectedUser, ROLES.ADMIN);
                      setShowAddModal(false);
                      setSelectedUser('');
                    }
                  }}
                  disabled={!selectedUser}
                  className="px-4 py-2 bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark text-sm font-medium rounded-lg hover:bg-accent-light/20 dark:hover:bg-accent-dark/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-light dark:focus:ring-offset-gray-800 dark:focus:ring-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Admin
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
