'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Header from '@/components/Header';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch, FaArrowLeft } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const Modal = dynamic(() => import('@/components/Modal'), { ssr: false });

export default function RegionalSupportPage() {
  // Client-side only code
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const [supports, setSupports] = useState([]);
  const [newSupport, setNewSupport] = useState({
    name: '',
    designation: '',
    contact_number: '',
    email: '',
    regions: '',
    states: '',
    cities: ''
  });
  
  const handleTagInput = (field, value) => {
    setNewSupport(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const filteredSupports = supports.filter(support =>
    support.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    support.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    support.regions?.some(region => region.toLowerCase().includes(searchTerm.toLowerCase())) ||
    support.cities?.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchSupports();
  }, []);

  const fetchSupports = async () => {
    try {
      const { data, error } = await supabase
        .from('regional_support')
        .select('*')
        .order('id');
      
      if (error) throw error;
      setSupports(data || []);
    } catch (error) {
      console.error('Error fetching regional support:', error);
      alert('Error loading regional support data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Process the arrays
      const processedSupport = {
        ...newSupport,
        regions: newSupport.regions.split('\n').map(x => x.trim()).filter(Boolean),
        states: newSupport.states.split('\n').map(x => x.trim()).filter(Boolean),
        cities: newSupport.cities.split('\n').map(x => x.trim()).filter(Boolean)
      };

      // Use the API route instead of direct database operations
      const apiUrl = '/api/regional-support';
      let method, body;

      if (editingId) {
        // Update existing support
        method = 'PUT';
        body = { ...processedSupport, id: editingId };
      } else {
        // Add new support
        method = 'POST';
        body = processedSupport;
      }

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save');
      }

      // Reset form
      setNewSupport({
        name: '',
        designation: '',
        contact_number: '',
        email: '',
        regions: '',
        states: '',
        cities: ''
      });
      setEditingId(null);
      setShowForm(false);
      fetchSupports();
      alert(editingId ? 'Regional support updated successfully!' : 'Regional support added successfully!');
    } catch (error) {
      console.error('Error saving regional support:', error);
      alert('Error saving regional support: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (support) => {
    setNewSupport({
      ...support,
      regions: Array.isArray(support.regions) ? support.regions.join('\n') : '',
      states: Array.isArray(support.states) ? support.states.join('\n') : '',
      cities: Array.isArray(support.cities) ? support.cities.join('\n') : ''
    });
    setEditingId(support.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    
    setIsDeleting(true);
    try {
      // Use the API route for deletion to ensure embeddings are also deleted
      const response = await fetch(`/api/regional-support?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete');
      }
      
      alert('Team member deleted successfully!');
      fetchSupports();
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Error deleting team member: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-light/10 via-transparent to-transparent dark:from-accent-dark/10 dark:via-transparent dark:to-transparent pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent-light/5 via-transparent to-transparent dark:from-accent-dark/5 dark:via-transparent dark:to-transparent pointer-events-none -z-10"></div>
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <FaArrowLeft size={14} />
                <span>Back to Admin</span>
              </button>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white relative px-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-light to-accent-dark dark:from-accent-dark dark:to-accent-light">
                    Regional Support Management
                  </span>
                </h1>
                <div className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Manage your regional support team members, their locations, and contact information.
                </div>
              </div>

              <div className="mt-8 max-w-4xl mx-auto flex items-center gap-4">
                <div className="flex-1 relative group">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-100 pointer-events-none opacity-70" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search support team members..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:outline-none transition-all duration-300"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingId(null);
                    setNewSupport({
                      name: '',
                      designation: '',
                      contact_number: '',
                      email: '',
                      regions: '',
                      states: '',
                      cities: ''
                    });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-light dark:bg-accent-dark hover:bg-accent-light/90 dark:hover:bg-accent-dark/90 rounded-lg transition-colors duration-200 relative z-10"
                >
                  <FaPlus size={14} />
                  <span>Add Team Member</span>
                </button>
              </div>
              
              <div className="mt-8">
              
              {mounted && showForm && (
                <Modal onClose={() => setShowForm(false)}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {editingId ? 'Edit' : 'Add'} Team Member
                        </h2>
                        <button
                          onClick={() => {
                            setShowForm(false);
                            setEditingId(null);
                            setNewSupport({
                              name: '',
                              designation: '',
                              contact_number: '',
                              email: '',
                              regions: '',
                              states: '',
                              cities: ''
                            });
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <FaTimes className="text-gray-500" size={16} />
                        </button>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={newSupport.name}
                              onChange={(e) => handleTagInput('name', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Designation
                            </label>
                            <input
                              type="text"
                              value={newSupport.designation}
                              onChange={(e) => handleTagInput('designation', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Contact Number
                            </label>
                            <input
                              type="tel"
                              value={newSupport.contact_number}
                              onChange={(e) => handleTagInput('contact_number', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={newSupport.email}
                              onChange={(e) => handleTagInput('email', e.target.value)}
                              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Regions (one per line)
                            </label>
                            <textarea
                              value={newSupport.regions}
                              onChange={(e) => handleTagInput('regions', e.target.value)}
                              rows={3}
              placeholder="Enter regions, one per line:
North
South
East
West"
                              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              States (one per line)
                            </label>
                            <textarea
                              value={newSupport.states}
                              onChange={(e) => handleTagInput('states', e.target.value)}
                              rows={3}
              placeholder="Enter states, one per line:
Maharashtra
Gujarat
Karnataka"
                              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Cities (one per line)
                            </label>
                            <textarea
                              value={newSupport.cities}
                              onChange={(e) => handleTagInput('cities', e.target.value)}
                              rows={4}
              placeholder="Enter cities, one per line:
Mumbai
Pune
Bangalore
Ahmedabad"
                              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSaving}
                            className={`px-4 py-2 text-sm font-medium text-white bg-accent-light dark:bg-accent-dark hover:bg-accent-light/90 dark:hover:bg-accent-dark/90 rounded-lg transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {isSaving ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {editingId ? 'Saving...' : 'Adding...'}
                              </span>
                            ) : (editingId ? 'Save Changes' : 'Add Team Member')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Modal>
              )}

              {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-light/20 border-t-accent-light"></div>
                  </div>
                ) : (
                  <div className="bg-white/90 dark:bg-gray-800/90 shadow-sm rounded-xl overflow-hidden ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] backdrop-blur-sm">
                    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-br from-accent-light/[0.07] to-transparent dark:from-accent-dark/[0.07] dark:to-transparent flex items-center justify-between">
                      <h2 className="text-base font-medium text-gray-900 dark:text-white">
                        {searchTerm ? `Search Results (${filteredSupports.length})` : 'All Regional Support Team'}
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredSupports.map((support) => (
                        <div key={support.id} className="group hover:bg-accent-light/[0.02] dark:hover:bg-accent-dark/[0.02] transition-colors">
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
                                  {support.name}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  {support.designation}
                                </p>
                                <div className="mt-4 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">Contact:</span> {support.contact_number}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">Email:</span> {support.email}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">Regions:</span>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {support.regions.map((region, index) => (
                                            <span 
                                              key={index}
                                              className="inline-block px-2 py-0.5 text-xs bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded"
                                            >
                                              {region}
                                            </span>
                                          ))}
                                        </div>
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">States:</span>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {support.states.map((state, index) => (
                                        <span 
                                          key={index}
                                          className="inline-block px-2 py-0.5 text-xs bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded"
                                        >
                                          {state}
                                        </span>
                                      ))}
                                    </div>
                                  </p>

                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Cities:</span>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {support.cities.map((city, index) => (
                                        <span 
                                          key={index}
                                          className="inline-block px-2 py-0.5 text-xs bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded"
                                        >
                                          {city}
                                        </span>
                                      ))}
                                    </div>
                                  </p>
                                </div>
                              </div>
                              <div className="ml-4 flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => handleEdit(support)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded-lg hover:bg-accent-light/20 dark:hover:bg-accent-dark/20 transition-colors"
                                  title="Edit Support Team Member"
                                >
                                  <FaEdit size={14} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(support.id)}
                                  disabled={isDeleting}
                                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 dark:bg-red-400/10 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-colors ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                  title="Delete Support Team Member"
                                >
                                  {isDeleting ? (
                                    <>
                                      <svg className="animate-spin h-3.5 w-3.5 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>Deleting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <FaTrash size={14} />
                                      <span>Delete</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
