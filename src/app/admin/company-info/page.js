'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Header from '@/components/Header';
import { FaEdit, FaTimes, FaArrowLeft, FaPlus, FaSearch } from 'react-icons/fa';
import { createPortal } from 'react-dom';

export default function CompanyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [newKey, setNewKey] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('key, content');
      
      if (error) throw error;
      const profileObj = {};
      data?.forEach(item => {
        profileObj[item.key] = item.content;
      });
      setProfile(profileObj || {});
    } catch (error) {
      console.error('Error fetching company profile:', error);
      alert('Error loading company profile');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = Object.entries(profile).filter(([key, value]) => {
    const searchLower = searchTerm.toLowerCase();
    return key.toLowerCase().includes(searchLower) || 
           (typeof value === 'string' && value.toLowerCase().includes(searchLower));
  });

  const handleAddNew = () => {
    setIsNewEntry(true);
    setNewKey('');
    setNewValue('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updates = {
        key: isNewEntry ? newKey : editingKey,
        content: newValue
      };

      const { error } = await supabase
        .from('company_info')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      
      setProfile(prev => ({ ...prev, [updates.key]: updates.content }));
      setEditingKey(null);
      setShowForm(false);
      setNewValue('');
      setIsNewEntry(false);
      setNewKey('');
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    }
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setNewValue(profile[key] || '');
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-light/10 via-transparent to-transparent dark:from-accent-dark/10 dark:via-transparent dark:to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent-light/5 via-transparent to-transparent dark:from-accent-dark/5 dark:via-transparent dark:to-transparent"></div>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl relative">
        <div className="mb-12 space-y-8">
          <div className="relative flex flex-col items-center gap-6">
            <button
              onClick={() => router.push('/admin')}
              className="self-start inline-flex items-center gap-2 px-3 py-1.5 text-sm text-accent-light dark:text-accent-dark hover:bg-accent-light/10 dark:hover:bg-accent-dark/10 rounded-lg transition-colors"
            >
              <FaArrowLeft size={14} />
              <span>Back to Admin</span>
            </button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white relative px-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-light to-accent-dark dark:from-accent-dark dark:to-accent-light">
                  Company Profile
                </span>
              </h1>
              <div className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Manage your company profile information
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-100 pointer-events-none opacity-70" size={16} />
              <input
                type="text"
                placeholder="Search information..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:outline-none transition-all duration-300"
              />
            </div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-light dark:bg-accent-dark text-white rounded-lg hover:bg-accent-light/90 dark:hover:bg-accent-dark/90 shadow-sm hover:shadow transition-all duration-300 shrink-0 text-sm"
            >
              <FaPlus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-light/20 border-t-accent-light"></div>
            </div>
          ) : (
            <div className="bg-white/90 dark:bg-gray-800/90 shadow-sm rounded-xl overflow-hidden ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] backdrop-blur-sm">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-br from-accent-light/[0.07] to-transparent dark:from-accent-dark/[0.07] dark:to-transparent">
                <h2 className="text-base font-medium text-gray-900 dark:text-white">
                  {searchTerm ? `Search Results (${filteredEntries.length})` : 'All Information'}
                </h2>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEntries.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No information found
                  </div>
                ) : (
                  filteredEntries.map(([key, value]) => (
                    <div key={key} className="group hover:bg-accent-light/[0.02] dark:hover:bg-accent-dark/[0.02] transition-colors">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
                              {key}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {typeof value === 'string' && (value.startsWith('{') || value.startsWith('[')) 
                                ? JSON.stringify(JSON.parse(value), null, 2)
                                : value || 'Not set'}
                            </p>
                          </div>
                          <div className="ml-4 flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleEdit(key)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded-lg hover:bg-accent-light/20 dark:hover:bg-accent-dark/20 transition-colors"
                              title="Edit Value"
                            >
                              <FaEdit size={14} />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showForm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  Edit {editingKey?.replace(/_/g, ' ')}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {isNewEntry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter key name"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                    {isNewEntry ? 'Content' : editingKey}
                  </label>
                  <textarea
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-accent-light dark:bg-accent-dark hover:bg-accent-light/90 dark:hover:bg-accent-dark/90 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
