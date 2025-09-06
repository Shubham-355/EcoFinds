import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(response.data.cartItems);
      setTotalAmount(response.data.totalAmount);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await removeItem(itemId);
        return;
      }

      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      await api.post('/orders/checkout');
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await api.delete('/cart');
        await fetchCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading cart...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="relative">
            <h1 className="brutal-header text-2xl bg-primary px-6 py-3 brutal-border shadow-brutal-sm rounded-brutal">
              SHOPPING CART
            </h1>
            {cartItems.length > 0 && (
              <span className="notification-count bg-secondary text-black">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="brutal-btn brutal-btn-secondary hover:bg-red-100 rounded-brutal"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white brutal-border shadow-brutal rounded-brutal">
            <div className="space-y-6">
              <div className="bg-bg-secondary p-6 brutal-border shadow-brutal-sm rounded-brutal inline-block">
                <ShoppingBag className="mx-auto h-16 w-16 text-black" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-black bg-primary px-6 py-3 brutal-border shadow-brutal-sm rounded-brutal inline-block">
                  YOUR CART IS EMPTY
                </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  to="/"
                  className="brutal-btn brutal-btn-primary px-6 py-3 text-sm rounded-brutal"
                >
                  BROWSE PRODUCTS
                </Link>
                <Link
                  to="/add-product"
                  className="brutal-btn brutal-btn-secondary px-6 py-3 text-sm rounded-brutal"
                >
                  SELL SOMETHING
                </Link>
              </div>
              
              <div className="bg-white p-4 brutal-border rounded-brutal-sm max-w-sm mx-auto">
                <p className="text-xs font-bold text-black">
                  💡 <span className="bg-warning px-1 py-0.5 rounded-brutal-xs">TIP:</span> 
                  Join our sustainable marketplace and help reduce waste by buying second-hand items!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white brutal-border shadow-brutal rounded-brutal">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 border-b-2 border-black last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.image || '/api/placeholder/100/100'}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover brutal-border rounded-brutal-xs"
                      />
                    </Link>
                    
                    <div className="flex-1">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="text-md font-black text-black hover:bg-primary p-2 brutal-border rounded-brutal-xs inline-block mb-2 transition-colors">
                          {item.product.title}
                        </h3>
                      </Link>
                      <p className="text-black font-bold bg-bg-secondary px-2 py-1 rounded-brutal-xs inline-block mb-2 text-sm">
                        by {item.product.user.username}
                      </p>
                      {item.product.category && (
                        <p className="text-xs font-semibold text-black bg-white px-2 py-1 brutal-border rounded-brutal-xs inline-block mr-2">
                          {item.product.category.name}
                        </p>
                      )}
                      <p className="text-lg font-black text-black bg-primary px-2 py-1 brutal-border rounded-brutal-xs inline-block shadow-brutal-xs">
                        ${item.product.price}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-bg-secondary p-2 rounded-brutal-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="brutal-btn brutal-btn-secondary p-1 rounded-brutal-xs hover:bg-primary"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-md px-3 py-1 brutal-border bg-white rounded-brutal-xs min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="brutal-btn brutal-btn-secondary p-1 rounded-brutal-xs hover:bg-primary"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-bold text-black bg-white px-2 py-1 brutal-border rounded-brutal-xs mb-2">
                        Subtotal
                      </p>
                      <p className="text-lg font-black text-black bg-white px-2 py-1 brutal-border rounded-brutal-xs shadow-brutal-xs">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="bg-red-300 text-black p-2 brutal-border hover:bg-red-400 shadow-brutal-xs font-black rounded-brutal-xs"
                      title="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-white brutal-border shadow-brutal p-6 rounded-brutal">
              <div className="space-y-4">
                <div className="relative flex justify-between items-center p-3 bg-bg-secondary brutal-border rounded-brutal-sm">
                  <span className="text-md font-black text-black">Items in cart:</span>
                  <span className="font-black text-black bg-primary px-2 py-1 brutal-border rounded-brutal-xs">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                  {cartItems.length > 3 && (
                    <span className="notification-dot bg-warning border-black"></span>
                  )}
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white brutal-border rounded-brutal-sm">
                  <span className="text-xl font-black text-black bg-warning px-3 py-2 brutal-border rounded-brutal-sm">
                    TOTAL:
                  </span>
                  <span className="text-2xl font-black text-black bg-primary px-4 py-2 brutal-border shadow-brutal-sm rounded-brutal-sm">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="relative w-full brutal-btn brutal-btn-primary text-lg py-4 disabled:opacity-50 rounded-brutal font-black"
                >
                  {checkoutLoading ? 'PROCESSING...' : 'PROCEED TO CHECKOUT'}
                  {!checkoutLoading && (
                    <span className="notification-dot bg-success border-black"></span>
                  )}
                </button>
                
                <Link
                  to="/"
                  className="block text-center brutal-btn brutal-btn-secondary rounded-brutal"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
