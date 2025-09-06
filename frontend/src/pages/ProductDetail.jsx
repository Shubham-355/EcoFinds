import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, User, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import ChatModal from '../components/ChatModal';
import EditProductModal from '../components/EditProductModal';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
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
      alert('Order completed successfully!');
      setShowChat(false);
      navigate('/orders');
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order');
    }
  };

  const handleEditComplete = (updatedProduct) => {
    setProduct(updatedProduct);
    setShowEdit(false);
    alert('Product updated successfully!');
  };

  const handleDelete = async () => {
    if (!product.isAvailable) {
      alert('Cannot delete sold products');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await api.delete(`/products/${id}`);
        alert('Product deleted successfully!');
        navigate('/my-listings');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(error.response?.data?.error || 'Failed to delete product');
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
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-black bg-bg-secondary p-2 border-3 border-black shadow-brutal-sm hover:bg-primary font-bold"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white border-4 border-black shadow-brutal overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 border-r-4 border-black">
              <img
                src={product.image || '/api/placeholder/600/400'}
                alt={product.title}
                className="w-full h-96 md:h-full object-cover"
              />
            </div>
            
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-black text-black mb-4 bg-primary p-3 border-3 border-black shadow-brutal-sm">
                {product.title}
              </h1>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-black bg-primary p-3 border-3 border-black shadow-brutal">
                  ${product.price}
                </span>
                {product.category && (
                  <span className="bg-bg-secondary text-black px-3 py-1 border-2 border-black text-sm font-bold">
                    {product.category.name}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-black text-black mb-2 bg-bg-secondary p-2 border-2 border-black">Description</h3>
                <p className="text-black leading-relaxed bg-bg-primary p-3 border-2 border-black font-bold">{product.description}</p>
              </div>

              {product.user && (
                <div className="mb-6 p-4 bg-bg-secondary border-3 border-black shadow-brutal-sm">
                  <h3 className="text-lg font-black text-black mb-2">Seller Information</h3>
                  <div className="flex items-center space-x-3">
                    {product.user.profilePhoto ? (
                      <img
                        src={product.user.profilePhoto}
                        alt={product.user.username}
                        className="w-10 h-10 border-2 border-black object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
                        <User size={20} className="text-black" />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-black">{product.user.username}</p>
                      <p className="text-sm text-black font-bold">Member since {new Date(product.user.createdAt).getFullYear()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {isOwner ? (
                  product.isAvailable ? (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowEdit(true)}
                        className="flex-1 bg-secondary text-black py-3 px-6 border-3 border-black shadow-brutal hover:bg-primary flex items-center justify-center space-x-2 text-lg font-black"
                      >
                        <Edit size={20} />
                        <span>Edit Product</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-300 text-black py-3 px-6 border-3 border-black shadow-brutal hover:bg-red-400 flex items-center justify-center space-x-2 text-lg font-black"
                      >
                        <Trash2 size={20} />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-black py-3 bg-bg-secondary border-3 border-black shadow-brutal">
                      <p className="mb-2 font-bold">This product has been sold</p>
                      <span className="bg-red-300 text-black px-3 py-1 border-2 border-black text-sm font-black">
                        SOLD
                      </span>
                    </div>
                  )
                ) : product.isAvailable ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-secondary text-black py-3 px-6 border-3 border-black shadow-brutal hover:bg-primary flex items-center justify-center space-x-2 text-lg font-black"
                    >
                      <ShoppingCart size={20} />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => setShowChat(true)}
                      className="w-full bg-primary text-black py-3 px-6 border-3 border-black shadow-brutal hover:bg-secondary flex items-center justify-center space-x-2 text-lg font-black"
                    >
                      <MessageCircle size={20} />
                      <span>Chat with Seller</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-gray-300 text-black py-3 px-6 border-3 border-black text-center text-lg font-black">
                    Not Available
                  </div>
                )}
              </div>

              <div className="mt-6 text-sm text-black bg-bg-primary p-2 border-2 border-black font-bold">
                <p>Posted on {new Date(product.createdAt).toLocaleDateString()}</p>
                {product.updatedAt !== product.createdAt && (
                  <p>Updated on {new Date(product.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {showChat && (
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

        {showEdit && (
          <EditProductModal
            product={product}
            onClose={() => setShowEdit(false)}
            onUpdate={handleEditComplete}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
