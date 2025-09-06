import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profilePhoto: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'profilePhoto') {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        profilePhoto: file,
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

    const submitData = new FormData();
    submitData.append('username', formData.username);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    if (formData.profilePhoto) {
      submitData.append('profilePhoto', formData.profilePhoto);
    }

    const result = await register(submitData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="brutal-card p-8 mb-6 rounded-brutal">
            <h2 className="brutal-header text-4xl mb-2 rounded-brutal inline-block">EcoFinds</h2>
            <p className="text-lg font-semibold text-gray-700">Second-Hand Marketplace</p>
          </div>
          <h3 className="text-2xl font-bold text-black bg-primary px-6 py-3 rounded-brutal shadow-brutal inline-block border-3  ">
            JOIN THE REVOLUTION!
          </h3>
        </div>
        
        <form className="brutal-card p-8 space-y-6 rounded-brutal" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border-3   text-black px-6 py-4 shadow-brutal font-black animate-pulse rounded-brutal">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-base font-black text-black mb-2 bg-warning p-2     shadow-brutal-sm inline-block rounded-brutal-sm">
              PROFILE PHOTO
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-bg-secondary border-3   shadow-brutal-sm flex items-center justify-center overflow-hidden hover:bg-primary transition-all rounded-brutal-sm">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={24} className="text-black" />
                )}
              </div>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                className="block w-full text-sm text-black font-bold file:mr-3 file:py-2 file:px-3 file:  file:  file:bg-secondary file:text-black file:font-bold file:shadow-brutal-sm hover:file:bg-primary file:hover:shadow-brutal file:transition-all file:rounded-brutal-sm rounded-brutal-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="username" className="block text-base font-black text-black bg-warning p-2     shadow-brutal-sm mb-2 inline-block rounded-brutal-sm">
              USERNAME
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="brutal-input w-full rounded-brutal"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-base font-black text-black bg-warning p-2     shadow-brutal-sm mb-2 inline-block rounded-brutal-sm">
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="brutal-input w-full rounded-brutal"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-base font-black text-black bg-warning p-2     shadow-brutal-sm mb-2 inline-block rounded-brutal-sm">
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="brutal-input w-full rounded-brutal"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full brutal-btn brutal-btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-brutal"
          >
            {loading ? 'CREATING...' : 'SIGN UP NOW'}
          </button>
          
          <div className="text-center pt-4">
            <Link to="/login" className="brutal-btn brutal-btn-secondary text-sm rounded-brutal">
              Already have an account? SIGN IN
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
