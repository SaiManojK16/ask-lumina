'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        email,
        password,
        firstName,
        lastName,
        redirect: false,
        isSignUp: true
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-light to-accent-dark dark:from-primary-dark dark:to-secondary-dark">
      <div className="bg-primary-light dark:bg-secondary-dark px-16 py-10 rounded-xl shadow-2xl max-w-2xl w-full backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90">
        <div className="flex justify-center mb-8">
          <Image src="https://luminascreens.com/wp-content/uploads/2023/05/canva-photo-editor-52-2.webp" alt="Lumina Logo" width={180} height={60} priority className="object-contain" />
        </div>
        <h1 className="text-xl font-semibold text-regular-light dark:text-regular-dark mb-6 text-center">Create an Account</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
                className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark placeholder-muted-light dark:placeholder-muted-dark transition-colors"
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
                className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark placeholder-muted-light dark:placeholder-muted-dark transition-colors"
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
              className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark placeholder-muted-light dark:placeholder-muted-dark transition-colors"
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
              className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark placeholder-muted-light dark:placeholder-muted-dark transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-accent-light to-accent-dark hover:from-accent-dark hover:to-accent-light text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-light dark:text-muted-dark">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-accent-light hover:text-accent-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
