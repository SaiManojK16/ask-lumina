'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignUp() {
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
      // Sign up with Supabase
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: `${window.location.origin}/auth/signin`
        }
      });

      if (signUpError) throw signUpError;

      // Show verification message
      setVerificationSent(true);
    } catch (error) {
      setError(error.message);
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
          <div className="text-center space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p>We've sent a verification link to <strong>{email}</strong></p>
              <p className="mt-2">Please check your email and click the link to verify your account.</p>
            </div>
            <p className="text-sm text-muted-light dark:text-muted-dark mt-4">
              After verifying your email, you can{' '}
              <Link 
                href="/auth/signin" 
                className="font-semibold text-accent-light dark:text-accent-dark hover:text-accent-dark dark:hover:text-accent-light"
              >
                sign in
              </Link>
              {' '}to your account.
            </p>
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

