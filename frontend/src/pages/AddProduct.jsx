import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import api from '../utils/api';
import Layout from '../components/Layout';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    
    // Check for duplicated product data
    const duplicatedProduct = localStorage.getItem('duplicateProduct');
    if (duplicatedProduct) {
      try {
        const productData = JSON.parse(duplicatedProduct);
        setFormData(prev => ({
          ...prev,
          ...productData
        }));
        localStorage.removeItem('duplicateProduct');
      } catch (error) {
        console.error('Error parsing duplicated product:', error);
      }
    }
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
      } else {
        setPreview('');
      }
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

    if (!formData.image) {
      setError('Product image is required');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('categoryId', formData.categoryId);
      submitData.append('image', formData.image);

      await api.post('/products', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/my-listings');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-black bg-bg-secondary p-2 border-3 border-black shadow-brutal-sm hover:bg-primary font-bold"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-black text-black mt-4 bg-primary p-4 border-4 border-black shadow-brutal">
            Add New Product
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border-4 border-black shadow-brutal p-6 space-y-6">
          {error && (
            <div className="bg-red-300 border-3 border-black text-black px-4 py-3 shadow-brutal-sm font-bold">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-black text-black mb-2">
              Product Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:bg-white font-bold"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-black text-black mb-2">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-secondary focus:outline-none font-bold"
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
            <label htmlFor="description" className="block text-sm font-black text-black mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:bg-white font-bold"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-black text-black mb-2">
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
              className="w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:bg-white font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-black mb-2">
              Product Image *
            </label>
            <div className="border-4 border-black bg-bg-secondary p-6">
              {preview ? (
                <div className="text-center">
                  <img src={preview} alt="Preview" className="mx-auto h-32 w-32 object-cover border-2 border-black" />
                  <p className="mt-2 text-sm text-black font-bold">Click to change image</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-black" />
                  <p className="mt-2 text-sm text-black font-bold">Click to upload an image</p>
                </div>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="mt-2 block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:border-3 file:border-black file:bg-secondary file:text-black file:font-bold file:shadow-brutal-sm hover:file:bg-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border-3 border-black shadow-brutal-sm text-black bg-bg-secondary hover:bg-bg-primary font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-black border-3 border-black shadow-brutal hover:bg-secondary disabled:opacity-50 font-black"
            >
              {loading ? 'Creating...' : 'Submit Listing'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddProduct;
