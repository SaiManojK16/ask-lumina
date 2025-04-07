'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Header from '@/components/Header';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { Manrope } from 'next/font/google';
import { createPortal } from 'react-dom';

const manrope = Manrope({ subsets: ['latin'] });

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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className={`min-h-screen bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark ${manrope.className}`}>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-light to-accent-dark bg-clip-text text-transparent">
            FAQ Management
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accent-light to-accent-dark text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            {showForm ? <FaTimes className="text-lg" /> : <FaPlus className="text-lg" />}
            {showForm ? 'Close Form' : 'Add New FAQ'}
          </button>
        </div>
      
      {/* Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-primary-light dark:bg-primary-dark rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-tertiary-light dark:border-tertiary-dark transform transition-all duration-300 scale-100 opacity-100"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-tertiary-light dark:border-tertiary-dark bg-gradient-to-r from-accent-light/10 to-accent-dark/10">
              <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark flex items-center gap-3">
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
                className="p-2 text-muted-light dark:text-muted-dark hover:text-regular-light dark:hover:text-regular-dark transition-colors hover:scale-110 transform"
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
                    className="w-full p-3 border border-tertiary-light dark:border-tertiary-dark rounded-md bg-secondary-light dark:bg-secondary-dark text-regular-light dark:text-regular-dark focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-regular-light dark:text-regular-dark">Answer:</label>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                    className="w-full p-3 border border-tertiary-light dark:border-tertiary-dark rounded-md bg-secondary-light dark:bg-secondary-dark text-regular-light dark:text-regular-dark focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:border-transparent h-32"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-regular-light dark:text-regular-dark">Category:</label>
                  <input
                    type="text"
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({...newFaq, category: e.target.value})}
                    className="w-full p-3 border border-tertiary-light dark:border-tertiary-dark rounded-md bg-secondary-light dark:bg-secondary-dark text-regular-light dark:text-regular-dark focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Modal Footer */}
                <div className="flex gap-4 justify-end mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setNewFaq({ question: '', answer: '', category: '' });
                    }}
                    className="px-6 py-2.5 border-2 border-tertiary-light dark:border-tertiary-dark text-regular-light dark:text-regular-dark hover:bg-tertiary-light/10 dark:hover:bg-tertiary-dark/10 rounded-lg transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-accent-light to-accent-dark text-white rounded-lg hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    {editingId ? (
                      <>
                        <FaEdit className="text-lg" />
                        Update FAQ
                      </>
                    ) : (
                      <>
                        <FaPlus className="text-lg" />
                        Add FAQ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className="bg-secondary-light dark:bg-secondary-dark rounded-xl shadow-lg overflow-hidden border border-tertiary-light dark:border-tertiary-dark">
        <div className="p-6 border-b border-tertiary-light dark:border-tertiary-dark bg-gradient-to-r from-accent-light/10 to-accent-dark/10">
          <h2 className="text-2xl font-semibold text-regular-light dark:text-regular-dark">Existing FAQs</h2>
        </div>
        <div className="divide-y divide-tertiary-light dark:divide-tertiary-dark">
          {faqs.map((faq) => (
            <div key={faq.id} className="group p-6 hover:bg-accent-light/5 dark:hover:bg-accent-dark/5 transition-all duration-200">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-semibold text-regular-light dark:text-regular-dark group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-muted-light dark:text-muted-dark whitespace-pre-wrap leading-relaxed">
                    {faq.answer}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded-full">
                    {faq.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="p-2 text-accent-light hover:text-accent-dark transition-colors duration-200 hover:scale-110 transform"
                    title="Edit FAQ"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-200 hover:scale-110 transform"
                    title="Delete FAQ"
                  >
                    <FaTrash size={20} />
                  </button>
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
