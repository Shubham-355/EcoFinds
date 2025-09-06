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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-primary p-4 border-4 border-black shadow-brutal mb-4 inline-block">
            <h2 className="text-4xl font-black text-black">EcoFinds</h2>
          </div>
          <h3 className="text-2xl font-bold text-black bg-bg-secondary p-3 border-3 border-black shadow-brutal-sm">
            Create your account
          </h3>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-6 border-4 border-black shadow-brutal" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-300 border-3 border-black text-black px-4 py-3 shadow-brutal-sm font-bold">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Profile Photo (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-bg-secondary border-3 border-black shadow-brutal-sm flex items-center justify-center overflow-hidden">
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
                className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:border-3 file:border-black file:bg-secondary file:text-black file:font-bold file:shadow-brutal-sm hover:file:bg-primary"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-black">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:ring-0 focus:bg-white font-bold"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-black">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:ring-0 focus:bg-white font-bold"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-black">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:ring-0 focus:bg-white font-bold"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border-3 border-black shadow-brutal text-lg font-black text-black bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
          
          <div className="text-center">
            <Link to="/login" className="text-black font-bold hover:bg-primary p-2 border-2 border-black shadow-brutal-sm bg-bg-secondary">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
