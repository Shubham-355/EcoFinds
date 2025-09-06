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
      <div className="max-w-2xl mx-auto brutal-border">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-black bg-bg-secondary px-2 py-2     shadow-brutal-sm hover:bg-primary font-bold rounded-brutal"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white     shadow-brutal-sm p-3 space-y-3 rounded-brutal">
          {error && (
            <div className="bg-red-300     text-black px-3 py-2 shadow-brutal-xs font-bold rounded-brutal">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block  text-xs font-black text-black mb-1 bg-warning px-2 py-1   rounded-brutal inline-block">
              Product Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-2 py-2 brutal-border   shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1   rounded-brutal inline-block">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-2 py-2  brutal-border   shadow-brutal-xs bg-bg-secondary focus:outline-none font-bold rounded-brutal"
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
            <label htmlFor="description" className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1    rounded-brutal inline-block">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-2 py-2   brutal-border  shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1   rounded-brutal inline-block">
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
              className="w-full px-2 py-2  brutal-border   shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1 bg-warning px-2 py-1    rounded-brutal inline-block">
              Product Image *
            </label>
            <div className=" brutal-border   bg-bg-secondary p-4 rounded-brutal">
              {preview ? (
                <div className="text-center">
                  <img src={preview} alt="Preview" className="mx-auto h-24 w-24 object-cover border  rounded-brutal" />
                  <p className="mt-2 text-xs text-black font-bold w-50">Click to change image</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-black " />
                  <p className="mt-2 text-xs text-black font-bold">Click to upload an image</p>
                </div>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="mt-2 block w-full brutal-border text-xs text-black file:mr-2 file:py-1 file:px-2 file:brutal-border  file:brutal-border  file:bg-secondary file:text-black file:font-bold file:shadow-brutal-xs hover:file:bg-primary file:rounded-brutal rounded-brutal"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-3 py-2   brutal-border  shadow-brutal-xs text-black bg-bg-secondary hover:bg-bg-primary hover:shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] font-bold transition-all rounded-brutal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-primary text-black   brutal-border  shadow-brutal-xs hover:bg-secondary hover:shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 font-black transition-all rounded-brutal"
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
