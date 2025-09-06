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
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b-2   sticky top-0 z-50 rounded-b-brutal">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <Link to="/" className="flex items-center">
              <div className=" text-lg font-black brutal-btn brutal-btn-primary text-[#C8FF00] bg-primary px-2 py-1 rounded-brutal">
                EcoFinds
              </div>
            </Link>
            
            <nav className="flex items-center space-x-2">
              <Link to="/" className="brutal-btn brutal-btn-secondary flex items-center space-x-1 text-xs px-2 py-1 rounded-brutal">
                <Home size={12} />
                <span>HOME</span>
              </Link>
              <Link to="/my-listings" className="brutal-btn brutal-btn-secondary flex items-center space-x-1 text-xs px-2 py-1 rounded-brutal">
                <Package size={12} />
                <span>LISTINGS</span>
              </Link>
              <Link to="/cart" className="brutal-btn brutal-btn-secondary flex items-center space-x-1 text-xs px-2 py-1 rounded-brutal">
                <ShoppingCart size={12} />
                <span>CART</span>
              </Link>
              <Link to="/orders" className="brutal-btn brutal-btn-secondary flex items-center space-x-1 text-xs px-2 py-1 rounded-brutal">
                <Package size={12} />
                <span>ORDERS</span>
              </Link>
              <Link to="/dashboard" className="brutal-btn brutal-btn-secondary flex items-center space-x-1 text-xs px-2 py-1 rounded-brutal">
                <User size={12} />
                <span>PROFILE</span>
              </Link>
              {user && (
                <Link to="/messages" className="brutal-btn brutal-btn-secondary flex items-center space-x-1 text-xs px-2 py-1 rounded-brutal">
                  <MessageCircle size={12} />
                  <span>CHAT</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="brutal-btn brutal-btn-secondary flex items-center space-x-1 text-xs px-2 py-1 hover:bg-red-100 rounded-brutal"
              >
                <LogOut size={12} />
                <span>OUT</span>
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="pt-4">
        <div className="container mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      <ChatbotButton />
    </div>
  );
};

export default Layout;
