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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-black bg-primary p-4 border-4 border-black shadow-brutal">
            Shopping Cart
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-black hover:bg-red-400 text-sm bg-red-300 p-2 border-2 border-black shadow-brutal-sm font-bold"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary border-4 border-black shadow-brutal">
            <ShoppingBag className="mx-auto h-16 w-16 text-black mb-4" />
            <p className="text-black text-lg mb-4 font-bold">Your cart is empty</p>
            <Link
              to="/"
              className="bg-primary text-black px-6 py-3 border-3 border-black shadow-brutal hover:bg-secondary inline-block font-black"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border-4 border-black shadow-brutal">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 border-b-4 border-black last:border-b-0">
                  <div className="flex items-center space-x-4 bg-bg-primary p-4 border-2 border-black">
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={item.product.image || '/api/placeholder/100/100'}
                        alt={item.product.title}
                        className="w-20 h-20 object-cover border-2 border-black"
                      />
                    </Link>
                    
                    <div className="flex-1">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="text-lg font-black text-black hover:bg-primary p-1 border border-black">
                          {item.product.title}
                        </h3>
                      </Link>
                      <p className="text-black text-sm mt-1 font-bold bg-bg-secondary p-1 border border-black">
                        by {item.product.user.username}
                      </p>
                      <p className="text-black font-black text-lg mt-2 bg-primary p-1 border-2 border-black">
                        ${item.product.price}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-white p-2 border-2 border-black">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border-2 border-black hover:bg-bg-secondary"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-black text-lg w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border-2 border-black hover:bg-bg-secondary"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-black hover:bg-red-400 p-2 bg-red-300 border-2 border-black"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border-4 border-black shadow-brutal p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-black bg-bg-secondary p-2 border-2 border-black">Total:</span>
                <span className="text-2xl font-black text-black bg-primary p-2 border-3 border-black shadow-brutal-sm">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-primary text-black py-3 px-6 border-3 border-black shadow-brutal hover:bg-secondary disabled:opacity-50 font-black text-lg"
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
