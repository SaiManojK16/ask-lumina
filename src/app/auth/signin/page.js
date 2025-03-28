'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignIn() {
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
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
          Sign In to Ask Lumina
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 border border-gray-300"
        >
          <Image 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google logo" 
            width={20} 
            height={20} 
            className="object-contain" 
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}