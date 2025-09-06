import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
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
            WELCOME BACK
          </h3>
        </div>
        
        <form className="brutal-card p-8 space-y-6 rounded-brutal" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border-3   text-black px-4 py-3 shadow-brutal font-bold rounded-brutal">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-black mb-2 bg-warning px-3 py-1     rounded-brutal-sm inline-block">
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
            <label htmlFor="password" className="block text-sm font-bold text-black mb-2 bg-warning px-3 py-1     rounded-brutal-sm inline-block">
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
            className="w-full brutal-btn brutal-btn-primary text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-brutal"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
          
          <div className="text-center pt-4">
            <Link to="/register" className="brutal-btn brutal-btn-secondary text-sm rounded-brutal">
              Don't have an account? SIGN UP
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
