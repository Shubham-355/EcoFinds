import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Gavel, Calendar, DollarSign } from 'lucide-react';
import api from '../utils/api';
import Layout from '../components/Layout';

const CreateAuction = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingBid: '',
    reservePrice: '',
    categoryId: '',
    image: null,
    startTime: '',
    endTime: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    
    // Set default times (start in 1 hour, end in 3 days)
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    
    setFormData(prev => ({
      ...prev,
      startTime: startTime.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16),
    }));
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

  const validateForm = () => {
    const { title, description, startingBid, categoryId, image, startTime, endTime } = formData;
    
    if (!title.trim()) return 'Title is required';
    if (!description.trim()) return 'Description is required';
    if (!startingBid || parseFloat(startingBid) <= 0) return 'Valid starting bid is required';
    if (!categoryId) return 'Category is required';
    if (!image) return 'Auction image is required';
    if (!startTime) return 'Start time is required';
    if (!endTime) return 'End time is required';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    
    if (start <= now) return 'Start time must be in the future';
    if (end <= start) return 'End time must be after start time';
    if (end - start < 30 * 60 * 1000) return 'Auction must run for at least 30 minutes';
    
    if (formData.reservePrice && parseFloat(formData.reservePrice) < parseFloat(startingBid)) {
      return 'Reserve price must be higher than starting bid';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('startingBid', formData.startingBid);
      if (formData.reservePrice) {
        submitData.append('reservePrice', formData.reservePrice);
      }
      submitData.append('categoryId', formData.categoryId);
      submitData.append('image', formData.image);
      submitData.append('startTime', new Date(formData.startTime).toISOString());
      submitData.append('endTime', new Date(formData.endTime).toISOString());

      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        await api.post('/auctions', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: controller.signal,
          timeout: 60000
        });
        clearTimeout(timeoutId);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50 animate-fade-in';
        notification.textContent = 'Auction created successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        navigate('/auctions');
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Create auction error:', error);
      
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        setError('Upload timeout. Please try with a smaller image or check your connection.');
      } else if (error.response?.status === 408) {
        setError(error.response?.data?.error || 'Request timeout. Please try again.');
      } else {
        setError(error.response?.data?.error || 'Failed to create auction. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-black bg-bg-secondary px-3 py-2 brutal-border shadow-brutal-sm hover:bg-primary font-bold rounded-brutal"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white brutal-border shadow-brutal p-6 rounded-brutal">
          <div className="text-center mb-6">
            <h1 className="brutal-header text-2xl bg-primary px-6 py-3 shadow-brutal-sm rounded-brutal inline-block">
              <Gavel className="inline mr-2" size={24} />
              CREATE AUCTION
            </h1>
            <p className="text-sm text-black mt-2 font-bold bg-bg-secondary p-2 brutal-border rounded-brutal">
              🔥 Start your auction and let buyers compete for your item!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-300 brutal-border text-black px-4 py-3 shadow-brutal font-bold rounded-brutal">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-black text-black mb-2 bg-warning px-2 py-1 brutal-border rounded-brutal inline-block">
                AUCTION TITLE *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
                placeholder="Enter auction title"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-black text-black mb-2 bg-warning px-2 py-1 brutal-border rounded-brutal inline-block">
                CATEGORY *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-bg-secondary focus:outline-none font-bold rounded-brutal"
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
              <label htmlFor="description" className="block text-sm font-black text-black mb-2 bg-warning px-2 py-1 brutal-border rounded-brutal inline-block">
                DESCRIPTION *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
                placeholder="Describe your item in detail"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startingBid" className="block text-sm font-black text-black mb-2 bg-warning px-2 py-1 brutal-border rounded-brutal inline-block">
                  <DollarSign size={14} className="inline mr-1" />
                  STARTING BID ($) *
                </label>
                <input
                  type="number"
                  id="startingBid"
                  name="startingBid"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.startingBid}
                  onChange={handleChange}
                  className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="reservePrice" className="block text-sm font-black text-black mb-2 bg-bg-secondary px-2 py-1 brutal-border rounded-brutal inline-block">
                  RESERVE PRICE ($)
                </label>
                <input
                  type="number"
                  id="reservePrice"
                  name="reservePrice"
                  min="0.01"
                  step="0.01"
                  value={formData.reservePrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
                  placeholder="Optional minimum price"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-black text-black mb-2 bg-warning px-2 py-1 brutal-border rounded-brutal inline-block">
                  <Calendar size={14} className="inline mr-1" />
                  START TIME *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-black text-black mb-2 bg-warning px-2 py-1 brutal-border rounded-brutal inline-block">
                  <Calendar size={14} className="inline mr-1" />
                  END TIME *
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2 bg-warning px-2 py-1 brutal-border rounded-brutal inline-block">
                AUCTION IMAGE *
              </label>
              <div className="brutal-border bg-bg-secondary p-4 rounded-brutal">
                {preview ? (
                  <div className="text-center">
                    <img src={preview} alt="Preview" className="mx-auto h-32 w-32 object-cover brutal-border rounded-brutal" />
                    <p className="mt-2 text-sm text-black font-bold">Click to change image</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-black" />
                    <p className="mt-2 text-sm text-black font-bold">Upload auction image</p>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="mt-3 block w-full text-sm text-black file:mr-3 file:py-2 file:px-3 file:brutal-border file:bg-secondary file:text-black file:font-bold file:shadow-brutal-xs hover:file:bg-primary file:rounded-brutal rounded-brutal"
                />
              </div>
            </div>

            <div className="bg-bg-secondary brutal-border p-4 rounded-brutal">
              <h3 className="text-sm font-black text-black mb-2">AUCTION TIPS:</h3>
              <ul className="text-xs text-black space-y-1 font-bold">
                <li>• Set a competitive starting bid to attract bidders</li>
                <li>• Use high-quality images to showcase your item</li>
                <li>• Write detailed descriptions to build trust</li>
                <li>• Reserve price ensures you get your minimum amount</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="px-4 py-2 brutal-border shadow-brutal-xs text-black bg-bg-secondary hover:bg-bg-primary hover:shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] font-bold transition-all rounded-brutal disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-black brutal-border shadow-brutal-xs hover:bg-secondary hover:shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 font-black transition-all rounded-brutal flex items-center space-x-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                <span>{loading ? 'Creating...' : 'CREATE AUCTION'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAuction;
