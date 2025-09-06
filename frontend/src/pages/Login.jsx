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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-primary p-4 border-4 border-black shadow-brutal mb-4 inline-block">
            <h2 className="text-4xl font-black text-black">EcoFinds</h2>
          </div>
          <h3 className="text-2xl font-bold text-black bg-bg-secondary p-3 border-3 border-black shadow-brutal-sm">
            Sign in to your account
          </h3>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-6 border-4 border-black shadow-brutal" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-300 border-3 border-black text-black px-4 py-3 shadow-brutal-sm font-bold">
              {error}
            </div>
          )}
          
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div className="text-center">
            <Link to="/register" className="text-black font-bold hover:bg-primary p-2 border-2 border-black shadow-brutal-sm bg-bg-secondary">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
