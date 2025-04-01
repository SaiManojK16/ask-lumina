'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

export default function ProfileDropdown() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getProfile = async () => {
      // First check NextAuth session
      if (session?.user) {
        setUserProfile({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          avatar_url: session.user.image,
        });
        return;
      }

      // Then check Supabase cookie
      const profileCookie = document.cookie.split('; ')
        .find(row => row.startsWith('user-profile='));
      
      if (profileCookie) {
        try {
          const profile = JSON.parse(decodeURIComponent(profileCookie.split('=')[1]));
          setUserProfile(profile);
          return;
        } catch (error) {
          console.error('Error parsing profile cookie:', error);
        }
      }

      // Finally check Supabase session
      const { data: { session: supaSession }, error } = await supabase.auth.getSession();
      if (supaSession?.user) {
        const profile = {
          id: supaSession.user.id,
          email: supaSession.user.email,
          name: supaSession.user.user_metadata?.full_name || supaSession.user.email,
          avatar_url: supaSession.user.user_metadata?.avatar_url,
        };
        setUserProfile(profile);
      }
    };

    getProfile();
  }, [session, supabase.auth]);

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
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700 dark:text-gray-200">{userProfile.name}</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {userProfile.email}
            </p>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={async () => {
                if (session) {
                  await signOut({ callbackUrl: '/auth/signin' });
                } else {
                  await supabase.auth.signOut();
                  window.location.href = '/auth/signin';
                }
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
