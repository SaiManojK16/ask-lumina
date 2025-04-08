'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Header from '@/components/Header';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';

export default function AdminDashboard() {
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('id');
      
      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      alert('Error loading FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing FAQ
        const { data, error } = await supabase
          .from('faqs')
          .update({
            question: newFaq.question,
            answer: newFaq.answer,
            category: newFaq.category
          })
          .eq('id', editingId)
          .select();

        if (error) throw error;
        alert('FAQ updated successfully!');
      } else {
        // Add new FAQ
        const { error } = await supabase
          .from('faqs')
          .insert([{
            question: newFaq.question,
            answer: newFaq.answer,
            category: newFaq.category
          }]);

        if (error) throw error;
        alert('FAQ added successfully!');
      }

      // Reset form and refresh FAQs
      setNewFaq({ question: '', answer: '', category: '' });
      setEditingId(null);
      setShowForm(false); // Hide form after successful submit
      fetchFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Error saving FAQ');
    }
  };

  const handleEdit = (faq) => {
    setNewFaq({
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    });
    setEditingId(faq.id);
    setShowForm(true); // Show form when editing
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('FAQ deleted successfully!');
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Error deleting FAQ');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-lg p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              FAQ Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage and organize frequently asked questions
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-light dark:bg-accent-dark hover:bg-accent-dark dark:hover:bg-accent-light text-white text-sm font-medium rounded-md shadow-sm transition-all duration-200 hover:shadow-md"
          >
            {showForm ? <FaTimes className="text-sm" /> : <FaPlus className="text-sm" />}
            {showForm ? 'Close' : 'Add FAQ'}
          </button>
        </div>
      
      {/* Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                {editingId ? (
                  <FaEdit className="text-accent-light dark:text-accent-dark text-2xl" />
                ) : (
                  <FaPlus className="text-accent-light dark:text-accent-dark text-2xl" />
                )}
                {editingId ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setNewFaq({ question: '', answer: '', category: '' });
                }}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:scale-110 transform"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-regular-light dark:text-regular-dark">Question:</label>
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-regular-light dark:text-regular-dark">Answer:</label>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm h-32"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-regular-light dark:text-regular-dark">Category:</label>
                  <input
                    type="text"
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({...newFaq, category: e.target.value})}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    required
                  />
                </div>
                
                {/* Modal Footer */}
                <div className="mt-6 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setNewFaq({ question: '', answer: '', category: '' });
                    }}
                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-accent-light dark:bg-accent-dark hover:bg-accent-dark dark:hover:bg-accent-light px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:ring-offset-2"
                  >
                    {editingId ? 'Update FAQ' : 'Add FAQ'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">All FAQs</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {faqs.map((faq) => (
            <div key={faq.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
                      {faq.question}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-1.5 rounded-md hover:bg-accent-light/10 dark:hover:bg-accent-dark/10 text-accent-light/70 dark:text-accent-dark/70 hover:text-accent-light dark:hover:text-accent-dark transition-colors"
                      title="Edit FAQ"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 dark:hover:bg-red-400/10 text-red-500/70 dark:text-red-400/70 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete FAQ"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
  );
}
