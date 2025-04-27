'use client';

import { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { getUserRole, ROLES } from '@/utils/roles';

export default function ProfileDropdown() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const getProfile = async () => {
      if (session?.user) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }

        const identityData = user.identities?.[0]?.identity_data;
        const profile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || identityData?.full_name || identityData?.name || user.email,
          avatar_url: user.user_metadata?.avatar_url || identityData?.avatar_url || identityData?.picture,
        };

        setUserProfile(profile);
        
        // Check if user is admin
        console.log('Session:', session);
        console.log('User metadata:', session.user.user_metadata);
        const role = getUserRole(session);
        console.log('User role:', role);
        setIsAdmin(role === ROLES.ADMIN);
        console.log('Is admin:', role === ROLES.ADMIN);
        return;
      }

      // If no session, clear the profile
      setUserProfile(null);
      return;
    };

    getProfile();
  }, [session, supabase]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userProfile) return null;

  const initials = userProfile.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        aria-label="Open user menu"
      >
        {userProfile.avatar_url ? (
          <Image
            src={userProfile.avatar_url}
            alt={userProfile.name || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <span className="text-lg font-semibold">{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700 dark:text-gray-200">{userProfile.name}</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {userProfile.email}
            </p>
          </div>
          {isAdmin && (
            <div className="border-t border-gray-100 dark:border-gray-700">
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Admin Dashboard
              </Link>
            </div>
          )}
          <div className="border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/auth/signin';
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
