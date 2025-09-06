import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut, Package, Home, MessageCircle } from 'lucide-react';
import ChatbotButton from './ChatbotButton';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-white border-b-4 border-black shadow-brutal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-black text-black bg-primary p-2 border-3 border-black shadow-brutal-sm">
                EcoFinds
              </div>
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-1 text-black hover:bg-primary p-2 border-2 border-black shadow-brutal-sm bg-bg-secondary font-bold">
                <Home size={20} />
                <span>Home</span>
              </Link>
              <Link to="/my-listings" className="flex items-center space-x-1 text-black hover:bg-primary p-2 border-2 border-black shadow-brutal-sm bg-bg-secondary font-bold">
                <Package size={20} />
                <span>Listings</span>
              </Link>
              <Link to="/cart" className="flex items-center space-x-1 text-black hover:bg-primary p-2 border-2 border-black shadow-brutal-sm bg-bg-secondary font-bold">
                <ShoppingCart size={20} />
                <span>Cart</span>
              </Link>
              <Link to="/orders" className="flex items-center space-x-1 text-black hover:bg-primary p-2 border-2 border-black shadow-brutal-sm bg-bg-secondary font-bold">
                <Package size={20} />
                <span>Orders</span>
              </Link>
              <Link to="/dashboard" className="flex items-center space-x-1 text-black hover:bg-primary p-2 border-2 border-black shadow-brutal-sm bg-bg-secondary font-bold">
                <User size={20} />
                <span>Profile</span>
              </Link>
              {user && (
                <Link to="/messages" className="text-black hover:bg-primary p-2 border-2 border-black shadow-brutal-sm bg-bg-secondary font-bold flex items-center space-x-1">
                  <MessageCircle size={20} />
                  <span>Messages</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-black hover:bg-red-300 p-2 border-2 border-black shadow-brutal-sm bg-secondary font-bold"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="pt-8">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      <ChatbotButton />
    </div>
  );
};

export default Layout;
