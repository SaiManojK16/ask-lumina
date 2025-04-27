'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { 
  FaCog, 
  FaQuestionCircle, 
  FaBuilding, 
  FaMapMarkerAlt,
  FaChevronRight,
  FaUsers 
} from 'react-icons/fa';
import { supabase } from '@/utils/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { isSuperAdmin } from '@/utils/roles';

const sections = [
  {
    title: 'Product Management',
    description: 'Configure product specifications, technical documentation, and feature sets',
    path: '/admin/products',
    icon: FaCog,
    table: 'products',
    metrics: {
      total: 'Products',
      value: '0'
    }
  },
  {
    title: 'Product FAQs',
    description: 'Manage frequently asked questions and product support information',
    path: '/admin/faqs',
    icon: FaQuestionCircle,
    table: 'faqs',
    metrics: {
      total: 'FAQs',
      value: '0'
    }
  },
  {
    title: 'Company Profile',
    description: 'Update company mission, vision, history, and market positioning',
    path: '/admin/company-info',
    icon: FaBuilding,
    table: 'company_info',
    metrics: {
      total: 'Documents',
      value: '0'
    }
  },
  {
    title: 'Support Team',
    description: 'Manage support team contacts and availability information',
    path: '/admin/regional-support',
    icon: FaMapMarkerAlt,
    table: 'regional_support',
    metrics: {
      total: 'Staff',
      value: '0'
    }
  }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({});
  const [user, setUser] = useState(null);
  const supabaseClient = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      for (const section of sections) {
        if (section.table) {
          try {
            const { count, error } = await supabase
              .from(section.table)
              .select('*', { count: 'exact', head: true });

            if (!error) {
              setMetrics(prev => ({
                ...prev,
                [section.table]: count || 0
              }));
            }
          } catch (error) {
            console.error(`Error fetching ${section.table} count:`, error);
          }
        }
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-light/10 via-transparent to-transparent dark:from-accent-dark/10 dark:via-transparent dark:to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent-light/5 via-transparent to-transparent dark:from-accent-dark/5 dark:via-transparent dark:to-transparent"></div>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl relative">
        <div className="space-y-8">
          
          <div className="mb-16 text-center relative">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent-light/30 dark:via-accent-dark/30 to-transparent"></div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white relative px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-light to-accent-dark dark:from-accent-dark dark:to-accent-light">
                Administration Console
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Secure enterprise management interface for system configuration and content administration
            </p>
            {user && isSuperAdmin(user) && (
              <button
                onClick={() => router.push('/admin/users')}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded-lg hover:bg-accent-light/20 dark:hover:bg-accent-dark/20 transition-colors text-sm font-medium group"
              >
                <FaUsers className="h-4 w-4" />
                Manage Users
                <FaChevronRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.path}
                  className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-sm ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] hover:shadow-lg hover:ring-accent-light/20 dark:hover:ring-accent-dark/20 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-light/[0.07] to-transparent dark:from-accent-dark/[0.07] dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-light/30 dark:via-accent-dark/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  
                  <button
                    onClick={() => router.push(section.path)}
                    className="w-full p-6 text-left relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-6">
                        <div className="flex flex-col">
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-light/10 to-accent-light/5 dark:from-accent-dark/10 dark:to-accent-dark/5 group-hover:from-accent-light/20 group-hover:to-accent-light/10 dark:group-hover:from-accent-dark/20 dark:group-hover:to-accent-dark/10 transition-all duration-300 mb-4 flex items-center justify-center">
                            <Icon className="w-12 h-12 text-accent-light/70 dark:text-accent-dark/70 group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-accent-light to-accent-dark group-hover:from-accent-dark group-hover:to-accent-light transition-all duration-300">
                              {metrics[section.table] || '0'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                              {section.metrics.total}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors mb-2">
                            {section.title}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors pr-8">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative group/arrow">
                        <div className="absolute -inset-2 bg-accent-light/5 dark:bg-accent-dark/5 rounded-lg scale-0 group-hover/arrow:scale-100 transition-transform duration-200"></div>
                        <FaChevronRight className="w-5 h-5 text-accent-light/70 dark:text-accent-dark/70 group-hover:text-accent-light dark:group-hover:text-accent-dark transform group-hover:translate-x-1.5 transition-all duration-300 relative z-10" />
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
