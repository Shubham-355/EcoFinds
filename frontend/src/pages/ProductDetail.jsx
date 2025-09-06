import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, User, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import EditProductModal from '../components/EditProductModal';
import ChatModal from '../components/ChatModal';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 });
      // Show success notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
      notification.textContent = 'Product added to cart!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
      notification.textContent = 'Failed to add product to cart';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  const handleStartChat = async () => {
    try {
      // Create initial message to start conversation
      await api.post('/chat/send', {
        productId: id,
        receiverId: product.user.id,
        content: `Hi! I'm interested in your product: ${product.title}`,
      });
      
      // Open chat modal instead of navigating
      setShowChat(true);
    } catch (error) {
      console.error('Error starting chat:', error);
      // If error, still open chat modal
      setShowChat(true);
    }
  };

  const handleOrderAgreed = async (agreedPrice = null, buyerId = null) => {
    try {
      const payload = {
        productId: id,
      };
      
      if (agreedPrice) {
        payload.agreedPrice = agreedPrice;
      }
      
      if (buyerId) {
        payload.buyerId = buyerId;
      }
      
      await api.post('/orders/checkout-direct', payload);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
      notification.textContent = 'Order completed successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      setShowChat(false);
      navigate('/orders');
    } catch (error) {
      console.error('Error completing order:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
      notification.textContent = 'Failed to complete order';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  const handleEditComplete = (updatedProduct) => {
    setProduct(updatedProduct);
    setShowEdit(false);
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
    notification.textContent = 'Product updated successfully!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handleDelete = async () => {
    if (!product.isAvailable) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-yellow-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
      notification.textContent = 'Cannot delete sold products';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await api.delete(`/products/${id}`);
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
        notification.textContent = 'Product deleted successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        navigate('/my-listings');
      } catch (error) {
        console.error('Error deleting product:', error);
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
        notification.textContent = error.response?.data?.error || 'Failed to delete product';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading product...</div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-12">Product not found</div>
      </Layout>
    );
  }

  const isOwner = user && product.user && user.id === product.user.id;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-black bg-bg-secondary p-2 brutal-border shadow-brutal-sm hover:bg-primary font-bold rounded-brutal-sm"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white brutal-border shadow-brutal overflow-hidden rounded-brutal">
          <div className="md:flex">
            <div className="md:w-1/2 border-r-2 border-black flex items-center justify-center bg-bg-secondary">
              <img
                src={product.image || '/api/placeholder/600/400'}
                alt={product.title}
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            
            <div className="md:w-1/2 p-4 md:p-6">
              <h1 className="text-2xl font-black text-black mb-3 bg-primary p-2 brutal-border shadow-brutal-sm rounded-brutal-sm">
                {product.title}
              </h1>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black text-black bg-primary p-2 shadow-brutal-sm rounded-brutal-sm">
                  ${product.price}
                </span>
                <div className="flex items-center space-x-2">
                  {product.category && (
                    <span className="bg-bg-secondary text-black px-2 py-1 brutal-border text-sm font-bold rounded-brutal-sm">
                      {product.category.name}
                    </span>
                  )}
                  {!product.isAvailable && (
                    <span className="bg-red-300 text-black px-2 py-1 brutal-border text-sm font-black rounded-brutal-sm relative">
                      SOLD
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border border-black rounded-full"></div>
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-black text-black mb-2 bg-bg-secondary p-2 brutal-border rounded-brutal-sm">Description</h3>
                <p className="text-black leading-relaxed bg-white p-2 brutal-border font-bold rounded-brutal-sm text-sm">{product.description}</p>
              </div>

              {product.user && (
                <div className="mb-4 p-3 bg-bg-secondary brutal-border shadow-brutal-sm rounded-brutal-sm">
                  <h3 className="text-md font-black text-black mb-2">Seller Information</h3>
                  <div className="flex items-center space-x-3">
                    {product.user.profilePhoto ? (
                      <img
                        src={product.user.profilePhoto}
                        alt={product.user.username}
                        className="w-8 h-8 brutal-border object-cover rounded-brutal-xs"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-white brutal-border flex items-center justify-center rounded-brutal-xs">
                        <User size={16} className="text-black" />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-black bg-white px-1 py-0.5 rounded-brutal-xs text-sm">{product.user.username}</p>
                      {/* <p className="text-xs text-black font-bold">Member since {new Date(product.user.createdAt).getFullYear()}</p> */}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {isOwner ? (
                  product.isAvailable ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowEdit(true)}
                        className="flex-1 bg-secondary text-black py-2 px-4 brutal-border shadow-brutal-sm hover:bg-primary hover:shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center space-x-2 text-sm font-black transition-all rounded-brutal-sm"
                      >
                        <Edit size={16} />
                        <span>Edit Product</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-300 text-black py-2 px-4 brutal-border shadow-brutal-sm hover:bg-red-400 hover:shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center space-x-2 text-sm font-black transition-all rounded-brutal-sm"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-black py-2 bg-bg-secondary shadow-brutal-sm rounded-brutal-sm">
                      <p className="mb-1 font-bold text-sm">This product has been sold</p>
                      <span className="bg-red-300 text-black px-2 py-1 brutal-border text-xs font-black rounded-brutal-xs">
                        SOLD
                      </span>
                    </div>
                  )
                ) : product.isAvailable ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-secondary text-black py-2 px-4 brutal-border shadow-brutal-sm hover:bg-primary hover:shadow-brutal hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2 text-sm font-black transition-all rounded-brutal-sm"
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={handleStartChat}
                      className="w-full bg-primary text-black py-2 px-4 brutal-border shadow-brutal-sm hover:bg-secondary hover:shadow-brutal hover:translate-x-1 hover:translate-y-1 flex items-center justify-center space-x-2 text-sm font-black transition-all rounded-brutal-sm"
                    >
                      <MessageCircle size={16} />
                      <span>Chat with Seller</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-red-300 text-black py-2 px-4 brutal-border text-center text-sm font-black shadow-brutal-sm rounded-brutal-sm">
                    Not Available
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-black bg-white p-2 font-bold rounded-brutal-sm">
                <p className="bg-bg-secondary p-1 mb-1 rounded-brutal-xs">Posted on {new Date(product.createdAt).toLocaleDateString()}</p>
                {product.updatedAt !== product.createdAt && (
                  <p className="bg-bg-secondary p-1 brutal-border rounded-brutal-xs">Updated on {new Date(product.updatedAt).toLocaleDateString()}</p>
                )}
                {!product.isAvailable && (
                  <p className="bg-red-200 p-1 brutal-border rounded-brutal-xs mt-1 font-black">
                    🔴 This item has been sold
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {showEdit && (
          <EditProductModal
            product={product}
            onClose={() => setShowEdit(false)}
            onUpdate={handleEditComplete}
          />
        )}

        {showChat && product && (
          <ChatModal
            productId={product.id}
            sellerId={product.user.id}
            sellerName={product.user.username}
            productTitle={product.title}
            originalPrice={product.price}
            onClose={() => setShowChat(false)}
            onOrderAgreed={handleOrderAgreed}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
