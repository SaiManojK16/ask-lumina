'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSetup() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const setupAdmin = async () => {
    try {
      setStatus('Setting up admin...');
      setError('');
      
      const response = await fetch('/api/admin/setup', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up admin');
      }
      
      setStatus('Successfully set up admin user!');
      // Redirect to admin dashboard after successful setup
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-light to-accent-dark">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Super Admin Setup</h1>
        
        <div className="mb-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This page is only accessible to set up the first super admin user. As a super admin, you will have:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
            <li>Full access to manage all users</li>
            <li>Ability to assign and revoke admin roles</li>
            <li>Access to all administrative features</li>
          </ul>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {status && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {status}
          </div>
        )}

        <button
          onClick={setupAdmin}
          className="w-full bg-gradient-to-r from-accent-light to-accent-dark hover:from-accent-dark hover:to-accent-light text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
        >
          Set Up Super Admin Access
        </button>
      </div>
    </div>
  );
}
