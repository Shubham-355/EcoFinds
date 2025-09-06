import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Plus, MessageCircle, Package, Menu, X, LogOut, Gavel } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatbotButton from './ChatbotButton';
import api from '../utils/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCartCount();
      fetchUnreadMessages();
    }
  }, [user, location.pathname]);

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart');
      const totalItems = response.data.cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/chat/conversations');
      const unreadCount = response.data.conversations?.filter(chat => 
        chat.lastMessage && chat.lastMessage.senderId !== user.id && !chat.lastMessage.read
      ).length || 0;
      setUnreadMessages(unreadCount);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      setUnreadMessages(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="bg-white brutal-border shadow-brutal border-b-2 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-black text-black bg-primary px-3 py-1 brutal-border shadow-brutal-sm hover:shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal-sm">
                EcoFinds
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <Link
                    to="/add-product"
                    className="flex items-center space-x-1 brutal-btn brutal-btn-primary text-xs hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal-sm"
                  >
                    <Plus size={16} />
                    <span>Sell</span>
                  </Link>
                  
                  <Link
                    to="/cart"
                    className="relative flex items-center space-x-1 brutal-btn brutal-btn-secondary text-xs hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal-sm"
                  >
                    <ShoppingCart size={16} />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="notification-count">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/messages"
                    className="relative flex items-center space-x-1 brutal-btn brutal-btn-secondary text-xs hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal-sm"
                  >
                    <MessageCircle size={16} />
                    <span>Messages</span>
                    {unreadMessages > 0 && (
                      <span className="notification-dot"></span>
                    )}
                  </Link>

                  <Link
                    to="/orders"
                    className="flex items-center space-x-1 brutal-btn brutal-btn-secondary text-xs hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal-sm"
                  >
                    <Package size={16} />
                    <span>Orders</span>
                  </Link>

                  <Link
                    to="/auctions"
                    className="flex items-center space-x-1 brutal-btn brutal-btn-secondary text-xs hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal-sm"
                  >
                    <Gavel size={16} />
                    <span>Auctions</span>
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-1 brutal-btn brutal-btn-secondary text-xs hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal-sm"
                    >
                      <User size={16} />
                      <span>{user.username}</span>
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white brutal-border shadow-brutal rounded-brutal z-50">
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-sm font-bold text-black hover:bg-primary transition-colors"
                          >
                            Dashboard
                          </Link>
                          <Link
                            to="/my-listings"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-sm font-bold text-black hover:bg-primary transition-colors"
                          >
                            My Listings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm font-bold text-black hover:bg-red-300 transition-colors"
                          >
                            <LogOut size={16} className="inline mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="brutal-btn brutal-btn-secondary text-xs rounded-brutal-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="brutal-btn brutal-btn-primary text-xs rounded-brutal-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden brutal-btn brutal-btn-secondary text-xs rounded-brutal-sm"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t-2 border-black bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {user ? (
                  <>
                    <Link
                      to="/add-product"
                      className="relative block px-3 py-2 text-sm font-bold text-black hover:bg-primary transition-colors rounded-brutal-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus size={16} className="inline mr-2" />
                      Sell Item
                    </Link>
                    
                    <Link
                      to="/cart"
                      className="relative block px-3 py-2 text-sm font-bold text-black hover:bg-primary transition-colors rounded-brutal-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart size={16} className="inline mr-2" />
                      Cart
                      {cartCount > 0 && (
                        <span className="ml-2 bg-primary text-black px-1 py-0.5 brutal-border text-xs font-black rounded-brutal-xs">
                          {cartCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/messages"
                      className="relative block px-3 py-2 text-sm font-bold text-black hover:bg-primary transition-colors rounded-brutal-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle size={16} className="inline mr-2" />
                      Messages
                      {unreadMessages > 0 && (
                        <span className="ml-2 bg-red-300 text-black px-1 py-0.5 brutal-border text-xs font-black rounded-brutal-xs">
                          {unreadMessages}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-sm font-bold text-black hover:bg-primary transition-colors rounded-brutal-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package size={16} className="inline mr-2" />
                      Orders
                    </Link>

                    <Link
                      to="/auctions"
                      className="block px-3 py-2 text-sm font-bold text-black hover:bg-primary transition-colors rounded-brutal-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Gavel size={16} className="inline mr-2" />
                      Auctions
                    </Link>

                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-sm font-bold text-black hover:bg-primary transition-colors rounded-brutal-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={16} className="inline mr-2" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm font-bold text-black hover:bg-red-300 transition-colors rounded-brutal-sm"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-sm font-bold text-black hover:bg-primary transition-colors rounded-brutal-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-sm font-bold text-black hover:bg-primary transition-colors rounded-brutal-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 p-4">
        {children}
      </main>

      <ChatbotButton />
    </div>
  );
};

export default Layout;
