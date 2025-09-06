import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import api from '../utils/api';

const EditProductModal = ({ product, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: product.title || '',
    description: product.description || '',
    price: product.price || '',
    categoryId: product.categoryId || product.category?.id || '',
    image: null,
    isAvailable: product.isAvailable,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(product.image || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
      });
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (e.target.type === 'checkbox') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.title.trim()) {
      setError('Product title is required');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      setLoading(false);
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setError('Valid price is required');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', formData.price);
      submitData.append('categoryId', formData.categoryId);
      submitData.append('isAvailable', formData.isAvailable);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await api.put(`/products/${product.id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUpdate(response.data.product);
    } catch (error) {
      console.error('Update product error:', error);
      setError(error.response?.data?.error || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white     shadow-brutal max-w-2xl w-full max-h-screen overflow-y-auto rounded-brutal">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-black bg-primary p-2 border   rounded-brutal-sm">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-black hover:bg-red-300 p-1 border   bg-red-200 rounded-brutal-xs"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-300     text-black px-3 py-2 font-bold rounded-brutal-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1 border   rounded-brutal-xs inline-block">
                Product Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-2 py-2     shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal-sm"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1 border   rounded-brutal-xs inline-block">
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-2 py-2     shadow-brutal-xs bg-bg-secondary focus:outline-none font-bold rounded-brutal-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1 border   rounded-brutal-xs inline-block">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-2 py-2     shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal-sm"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1 border   rounded-brutal-xs inline-block">
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-2 py-2     shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1 border   rounded-brutal-xs inline-block">
                Product Image
              </label>
              <div className="    bg-bg-secondary p-4 rounded-brutal-sm">
                {preview ? (
                  <div className="text-center">
                    <img src={preview} alt="Preview" className="mx-auto h-24 w-24 object-cover border   rounded-brutal-xs" />
                    <p className="mt-2 text-xs text-black font-bold">Click to change image</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-black" />
                    <p className="mt-2 text-xs text-black font-bold">Click to upload an image</p>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="mt-2 block w-full text-xs text-black file:mr-2 file:py-1 file:px-2 file:  file:  file:bg-secondary file:text-black file:font-bold file:shadow-brutal-xs hover:file:bg-primary file:rounded-brutal-xs rounded-brutal-xs"
                />
              </div>
            </div>

            <div className="flex items-center p-2 bg-bg-primary border   rounded-brutal-xs">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4     shadow-brutal-xs focus:ring-0 rounded-brutal-xs"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-xs font-black text-black">
                Available for sale
              </label>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2     shadow-brutal-xs text-black bg-bg-secondary hover:bg-bg-primary font-bold rounded-brutal-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 bg-primary text-black     shadow-brutal-xs hover:bg-secondary disabled:opacity-50 font-black rounded-brutal-sm"
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
