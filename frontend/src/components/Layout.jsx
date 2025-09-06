import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Package, Home, MessageCircle } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-green-600">EcoFinds</div>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <Home size={20} />
                <span>Home</span>
              </Link>
              <Link to="/my-listings" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <Package size={20} />
                <span>My Listings</span>
              </Link>
              <Link to="/cart" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <ShoppingCart size={20} />
                <span>Cart</span>
              </Link>
              <Link to="/orders" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <Package size={20} />
                <span>Orders</span>
              </Link>
              <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                <User size={20} />
                <span>Profile</span>
              </Link>
              {user && (
                <Link to="/messages" className="text-gray-700 hover:text-green-600 flex items-center space-x-1">
                  <MessageCircle size={20} />
                  <span>Messages</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
