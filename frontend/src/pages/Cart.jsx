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
          <h1 className="brutal-header text-2xl bg-primary px-6 py-3     shadow-brutal-sm rounded-brutal">
            SHOPPING CART
          </h1>
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
          <div className="text-center py-12 brutal-card rounded-brutal">
            <div className="bg-gray-100 p-4     inline-block mb-4 shadow-brutal-sm rounded-brutal">
              <ShoppingBag className="mx-auto h-12 w-12 text-black" />
            </div>
            <p className="text-black text-lg mb-4 font-bold bg-white px-3 py-2 border   rounded-brutal-sm inline-block">
              Your cart is empty
            </p>
            <Link
              to="/"
              className="brutal-btn brutal-btn-primary rounded-brutal"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="brutal-card rounded-brutal">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 border-b-2   last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.image || '/api/placeholder/100/100'}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover     rounded-brutal-xs"
                      />
                    </Link>
                    
                    <div className="flex-1">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="text-md font-bold text-black hover:underline bg-white px-2 py-1 border   rounded-brutal-xs inline-block">
                          {item.product.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 font-semibold bg-bg-secondary px-2 py-1 border   rounded-brutal-xs inline-block mt-1 text-sm">
                        by {item.product.user.username}
                      </p>
                      <p className="text-lg font-black text-black mt-2 bg-primary px-2 py-1 border   rounded-brutal-xs inline-block">
                        ${item.product.price}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="brutal-btn brutal-btn-secondary p-1 rounded-brutal-xs"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-md px-2 py-1 border   bg-white rounded-brutal-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="brutal-btn brutal-btn-secondary p-1 rounded-brutal-xs"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="brutal-btn brutal-btn-secondary hover:bg-red-100 p-2 rounded-brutal-xs"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="brutal-card p-6 rounded-brutal">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold bg-bg-secondary px-3 py-2 border   rounded-brutal-sm">Total:</span>
                <span className="text-2xl font-black text-black bg-primary px-3 py-2     shadow-brutal-sm rounded-brutal-sm">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full brutal-btn brutal-btn-primary text-md py-3 disabled:opacity-50 rounded-brutal"
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
