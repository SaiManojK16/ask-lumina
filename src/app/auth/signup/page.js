'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignUp() {
  const supabase = createClientComponentClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim()
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        // Check for specific error messages
        if (error.message?.toLowerCase().includes('already registered') || 
            error.message?.toLowerCase().includes('already taken')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(error.message || 'An error occurred during signup');
        }
      } else if (data?.user) {
        setVerificationSent(true);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-light to-accent-dark dark:from-primary-dark dark:to-secondary-dark">
      <div className="bg-primary-light dark:bg-secondary-dark px-16 py-10 rounded-xl shadow-2xl max-w-2xl w-full backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90">
        <div className="flex justify-center mb-8">
          <Image 
            src="https://luminascreens.com/wp-content/uploads/2023/05/canva-photo-editor-52-2.webp" 
            alt="Lumina Logo" 
            width={200} 
            height={100} 
            priority 
            className="object-contain" 
          />
        </div>
        
        <h1 className="text-xl font-semibold text-regular-light dark:text-regular-dark mb-6 text-center">
          {verificationSent ? 'Check Your Email' : 'Create an Account'}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {verificationSent ? (
          <div className="text-center max-w-xl mx-auto">
            <div className="mb-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Almost there!</h2>
              <p className="text-gray-600 dark:text-gray-400">Please check your email</p>
              <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">{email}</p>
            </div>

            <div className="space-y-6 w-full">
              <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Next steps:</p>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 ml-4 list-decimal">
                  <li>Click the verification link in your email</li>
                  <li>Once verified, <Link href="/auth/signin" className="inline-flex items-center text-accent-light hover:text-accent-dark dark:text-accent-dark dark:hover:text-accent-light font-medium">sign in to your account <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></Link></li>
                </ol>
              </div>

              <div className="text-left bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                <div className="text-sm text-amber-800 dark:text-amber-200 flex items-center justify-between gap-6">
                  <span>No email? You might already have an account</span>
                  <Link 
                    href="/auth/signin" 
                    className="shrink-0 inline-flex items-center px-4 py-2 rounded-md bg-accent-light hover:bg-accent-dark text-white font-medium transition-colors"
                  >
                    Sign in now
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-regular-light dark:text-regular-dark mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-regular-light dark:text-regular-dark mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-regular-light dark:text-regular-dark mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-regular-light dark:text-regular-dark mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-light to-accent-dark hover:from-accent-dark hover:to-accent-light text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="text-center">
              <p className="text-sm text-muted-light dark:text-muted-dark">
                Already have an account?{' '}
                <Link 
                  href="/auth/signin" 
                  className="font-semibold text-accent-light dark:text-accent-dark hover:text-accent-dark dark:hover:text-accent-light"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

