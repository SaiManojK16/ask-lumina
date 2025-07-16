'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Header from '@/components/Header';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch, FaArrowLeft } from 'react-icons/fa';
import ProductDetail from '@/components/ProductDetail';
import { createPortal } from 'react-dom';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    material: '',
    surface: '',
    projection_type: '',
    gain: '',
    technical_datasheet: '',
    features: '',
    why_choose_this: '',
    product_specs: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Process the textarea values before submission
      const processedProduct = {
        ...newProduct,
        features: newProduct.features.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [title, ...details] = line.split(':');
            return details.length > 0
              ? { title: title.trim(), details: details.join(':').trim() }
              : { title: line.trim(), details: '' };
          }),
        why_choose_this: newProduct.why_choose_this.split('\n').filter(line => line.trim()),
        product_specs: newProduct.product_specs.split('\n').filter(line => line.trim())
      };
      
      // Use the API route instead of direct database operations
      const apiUrl = '/api/products';
      let method, body;

      if (editingId) {
        // Update existing product
        method = 'PUT';
        body = { ...processedProduct, id: editingId };
      } else {
        // Add new product
        method = 'POST';
        body = processedProduct;
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

      setNewProduct({
        name: '',
        description: '',
        material: '',
        surface: '',
        projection_type: '',
        gain: '',
        technical_datasheet: '',
        features: '',
        why_choose_this: '',
        product_specs: ''
      });
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
      alert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    // Format the arrays into newline-separated strings
    setNewProduct({
      ...product,
      features: Array.isArray(product.features) 
        ? product.features.map(f => {
            if (typeof f === 'string') return f;
            return f.details ? `${f.title}: ${f.details}` : f.title;
          }).join('\n')
        : '',
      why_choose_this: Array.isArray(product.why_choose_this) 
        ? product.why_choose_this.join('\n')
        : '',
      product_specs: Array.isArray(product.product_specs) 
        ? product.product_specs.join('\n')
        : '',
      gain: product.gain || '',
      technical_datasheet: product.technical_datasheet || ''
    });
    setEditingId(product.id);
    setShowForm(true);
    setSelectedProduct(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setIsDeleting(true);
    try {
      // Use the API route for deletion to ensure embeddings are also deleted
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete');
      }
      
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.surface.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.projection_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  Product Management
                </span>
              </h1>
              <div className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Configure and manage product specifications, features, and technical details
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="flex-1 relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 dark:text-white pointer-events-none" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:outline-none transition-all duration-300"
              />
            </div>
            <button
              onClick={() => {
                setNewProduct({
                  name: '',
                  description: '',
                  material: '',
                  surface: '',
                  projection_type: '',
                  features: [],
                  why_choose_this: [],
                  product_specs: []
                });
                setEditingId(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-light dark:bg-accent-dark text-white rounded-lg hover:bg-accent-light/90 dark:hover:bg-accent-dark/90 shadow-sm hover:shadow transition-all duration-300 shrink-0 text-sm"
            >
              <FaPlus size={14} className="text-white/90" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-light/20 border-t-accent-light"></div>
            </div>
          ) : selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ) : (
            <div className="bg-white/90 dark:bg-gray-800/90 shadow-sm rounded-xl overflow-hidden ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] backdrop-blur-sm">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-br from-accent-light/[0.07] to-transparent dark:from-accent-dark/[0.07] dark:to-transparent flex items-center justify-between">
                <h2 className="text-base font-medium text-gray-900 dark:text-white">
                  {searchTerm ? `Search Results (${filteredProducts.length})` : 'All Products'}
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="p-6 hover:bg-accent-light/[0.02] dark:hover:bg-accent-dark/[0.02] cursor-pointer group transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {product.description}
                        </p>
                      </div>
                      <div className="ml-4 flex shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.technical_datasheet) {
                              window.open(product.technical_datasheet, '_blank');
                            }
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm ${product.technical_datasheet ? 'bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark hover:bg-accent-light/20 dark:hover:bg-accent-dark/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'} rounded-lg transition-colors`}
                          title={product.technical_datasheet ? 'View Technical Datasheet' : 'No datasheet available'}
                          disabled={!product.technical_datasheet}
                        >
                          Technical Datasheet
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded-lg">
                        {product.material}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                        {product.surface}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                        {product.projection_type}
                      </span>
                      {product.gain && (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                          Gain: {product.gain}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showForm && createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Material
                      </label>
                      <input
                        type="text"
                        value={newProduct.material}
                        onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Surface
                      </label>
                      <input
                        type="text"
                        value={newProduct.surface}
                        onChange={(e) => setNewProduct({ ...newProduct, surface: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Projection Type
                      </label>
                      <input
                        type="text"
                        value={newProduct.projection_type}
                        onChange={(e) => setNewProduct({ ...newProduct, projection_type: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gain
                      </label>
                      <input
                        type="text"
                        value={newProduct.gain}
                        onChange={(e) => setNewProduct({ ...newProduct, gain: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Technical Datasheet URL
                    </label>
                    <input
                      type="url"
                      value={newProduct.technical_datasheet}
                      onChange={(e) => setNewProduct({ ...newProduct, technical_datasheet: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                      placeholder="https://example.com/datasheet.pdf"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Features (one per line)
                    </label>
                    <textarea
                      value={newProduct.features}
                      onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                      placeholder="Enter features, one per line:&#10;High Contrast: Superior image quality&#10;Easy Installation: Quick setup process"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Why Choose This (one per line)
                    </label>
                    <textarea
                      value={newProduct.why_choose_this}
                      onChange={(e) => setNewProduct({ ...newProduct, why_choose_this: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                      placeholder="Enter reasons, one per line:&#10;Perfect for home theaters&#10;Easy to clean and maintain"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Specifications (one per line)
                    </label>
                    <textarea
                      value={newProduct.product_specs}
                      onChange={(e) => setNewProduct({ ...newProduct, product_specs: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-light/20 dark:focus:ring-accent-dark/20 focus:border-accent-light dark:focus:border-accent-dark"
                      placeholder="Enter specifications, one per line:&#10;Screen Size: 100 inches&#10;Weight: 15 kg"
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
                      ) : (editingId ? 'Save Changes' : 'Add Product')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
      </main>
    </div>
  );
}
