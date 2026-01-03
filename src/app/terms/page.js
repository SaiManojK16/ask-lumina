'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-muted-light dark:text-muted-dark mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose dark:prose-invert max-w-none text-regular-light dark:text-regular-dark space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">1. Acceptance of Terms</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                By accessing or using Ask Lumina, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">2. Description of Service</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                Ask Lumina is an AI-powered platform that provides assistance with home theater setup recommendations, product information, FAQs, and customer support for Lumina Screens products. The service uses artificial intelligence to respond to user queries and provide relevant information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">3. User Accounts</h2>
              <p className="text-regular-light dark:text-regular-dark mb-3">When creating an account, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-regular-light dark:text-regular-dark">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information as necessary</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">4. Acceptable Use</h2>
              <p className="text-regular-light dark:text-regular-dark mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-regular-light dark:text-regular-dark">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to the service or its systems</li>
                <li>Interfere with or disrupt the service or servers connected to the service</li>
                <li>Reverse engineer, decompile, or disassemble any part of the service</li>
                <li>Use automated systems (bots, scrapers) to access the service without permission</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">5. Third-Party Services</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                Ask Lumina uses third-party services including Google OAuth for authentication and OpenAI for AI functionality. We are not responsible for the availability, accuracy, or reliability of these third-party services. Your use of third-party services is subject to their respective terms and conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">6. Intellectual Property</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                All content, features, and functionality of Ask Lumina, including but not limited to text, graphics, logos, and software, are the property of Ask Lumina or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">7. Termination</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                We reserve the right to suspend or terminate your account and access to the service at any time, with or without cause or notice, for any reason including violation of these Terms of Service. Upon termination, your right to use the service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">8. Disclaimers</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                The service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, error-free, or completely secure. The AI-generated responses are provided for informational purposes and should not be considered as professional advice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">9. Limitation of Liability</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                To the fullest extent permitted by law, Ask Lumina shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">10. Governing Law</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in the United States.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">11. Changes to Terms</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any significant changes by posting the updated terms on this page and updating the "Last updated" date. Your continued use of the service after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark mb-4">12. Contact Information</h2>
              <p className="text-regular-light dark:text-regular-dark leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
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

