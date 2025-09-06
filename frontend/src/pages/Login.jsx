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
    <div className="min-h-screen flex bg-bg-primary">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary brutal-border-r flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="text-center space-y-8 z-10">
          <div className="brutal-card p-12 bg-white shadow-brutal rounded-brutal">
            <h1 className="brutal-header text-5xl mb-4 rounded-brutal inline-block">EcoFinds</h1>
            <p className="text-2xl font-bold text-gray-700 bg-bg-secondary px-6 py-3 brutal-border rounded-brutal shadow-brutal-sm">
              Second-Hand Marketplace
            </p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-black bg-white px-8 py-4 rounded-brutal shadow-brutal inline-block brutal-border">
              WELCOME BACK!
            </h2>
            
            <div className="brutal-card p-8 bg-white rounded-brutal max-w-md">
              <p className="text-lg font-bold text-black leading-relaxed">
                🌱 <span className="bg-secondary px-2 py-1 rounded-brutal-xs">Join</span> the sustainable revolution! 
                <br />
                <span className="bg-warning px-2 py-1 rounded-brutal-xs mt-2 inline-block">Buy</span> and 
                <span className="bg-primary px-2 py-1 rounded-brutal-xs ml-1">sell</span> pre-loved items.
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-secondary brutal-border rounded-brutal rotate-12 opacity-50"></div>
        <div className="absolute bottom-20 right-16 w-20 h-20 bg-warning brutal-border rounded-brutal -rotate-12 opacity-50"></div>
        <div className="absolute top-1/3 right-8 w-12 h-12 bg-white brutal-border rounded-brutal rotate-45 opacity-30"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Branding */}
          <div className="text-center lg:hidden">
            <div className="brutal-card p-6 mb-6 rounded-brutal">
              <h2 className="brutal-header text-3xl mb-2 rounded-brutal inline-block">EcoFinds</h2>
              <p className="text-base font-semibold text-gray-700">Second-Hand Marketplace</p>
            </div>
            <h3 className="text-xl font-bold text-black bg-primary px-4 py-2 rounded-brutal shadow-brutal inline-block brutal-border">
              WELCOME BACK
            </h3>
          </div>
          
          <form className="brutal-card p-8 space-y-6 rounded-brutal" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 brutal-border text-black px-4 py-3 shadow-brutal font-bold rounded-brutal">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-base font-black text-black mb-2 bg-warning p-2 brutal-border shadow-brutal-sm rounded-brutal-sm inline-block">
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
              <label htmlFor="password" className="block text-base font-black text-black mb-2 bg-warning p-2 brutal-border shadow-brutal-sm rounded-brutal-sm inline-block">
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
              {loading ? 'SIGNING IN...' : 'SIGN IN NOW'}
            </button>
            
            <div className="text-center pt-4">
              <Link to="/register" className="brutal-btn brutal-btn-secondary text-sm rounded-brutal">
                Don't have an account? SIGN UP
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
