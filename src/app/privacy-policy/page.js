'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';

export default function PrivacyPolicy() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for existing dark mode preference
    const isDark = document.body.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      document.body.classList.toggle("dark", newTheme);
      return newTheme;
    });
  };

  return (
    <div className="min-h-screen bg-primary-light dark:bg-primary-dark transition-all duration-300">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-sm ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] p-8 md:p-12">
          <h1 className="text-4xl font-bold text-regular-light dark:text-regular-dark mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-light dark:text-muted-dark mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose dark:prose-invert max-w-none text-regular-light dark:text-regular-dark space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">1. Introduction</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                Welcome to Ask Lumina, an AI-powered assistant application designed to help customers with home theater setup recommendations, FAQs, and product details from Lumina Screens. This Privacy Policy explains how we collect, use, and protect your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">2. Information We Collect</h2>
              <p className="text-regular-light dark:text-regular-dark mb-3">We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2 text-regular-light dark:text-regular-dark">
                <li><strong>Personal Information from Google OAuth:</strong> When you sign in with Google, we collect your name, email address, and profile picture.</li>
                <li><strong>Account Information:</strong> Information you provide when creating an account, such as email address and password.</li>
                <li><strong>Usage Data:</strong> Basic analytics including device information, browser type, and how you interact with our application.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">3. How We Use Information</h2>
              <p className="text-regular-light dark:text-regular-dark mb-3">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 text-regular-light dark:text-regular-dark">
                <li>User authentication and account management</li>
                <li>Improving app functionality and user experience</li>
                <li>Security and fraud prevention</li>
                <li>Responding to your inquiries and providing customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">4. Google OAuth & Third-Party Services</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                Ask Lumina uses Google Sign-In for authentication. When you choose to sign in with Google, Google shares your basic profile information (name, email, profile picture) with us. This information is used solely for authentication and account management purposes. We do not sell, rent, or misuse your Google data. You can revoke Google access at any time through your Google account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">5. Data Storage & Security</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                We store your data securely using industry-standard practices. All data is encrypted in transit and at rest. Access to your personal information is restricted to authorized personnel only and is protected by appropriate security measures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">6. Data Sharing</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                We do not sell your personal information to third parties. We may share your data only when legally required, necessary for app functionality, or to protect our rights and safety. We may use third-party service providers (such as hosting services) who are bound by confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">7. User Rights</h2>
              <p className="text-regular-light dark:text-regular-dark mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-regular-light dark:text-regular-dark">
                <li>Access and review your personal information</li>
                <li>Update or correct your account information</li>
                <li>Delete your account and associated data</li>
                <li>Revoke Google OAuth access at any time through your Google account settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">8. Cookies & Tracking</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                We use basic cookies for authentication and analytics purposes. These cookies are essential for the app to function properly and help us improve our services. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">9. Children's Privacy</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                Ask Lumina is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">10. Changes to This Policy</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of any significant changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">11. Contact Information</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="text-regular-light dark:text-regular-dark mt-3">
                <strong>Email:</strong> info@luminascreens.com
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

