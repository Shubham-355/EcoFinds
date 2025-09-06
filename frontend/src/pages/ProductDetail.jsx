import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={product.image || '/api/placeholder/600/400'}
                alt={product.title}
                className="w-full h-96 md:h-full object-cover"
              />
            </div>
            
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-green-600">
                  ${product.price}
                </span>
                {product.category && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {product.category.name}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {product.user && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
                  <div className="flex items-center space-x-3">
                    {product.user.profilePhoto ? (
                      <img
                        src={product.user.profilePhoto}
                        alt={product.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{product.user.username}</p>
                      <p className="text-sm text-gray-500">Member since {new Date(product.user.createdAt).getFullYear()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {!isOwner && product.isAvailable && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2 text-lg font-semibold"
                  >
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                )}

                {!product.isAvailable && (
                  <div className="w-full bg-gray-400 text-white py-3 px-6 rounded-md text-center text-lg font-semibold">
                    Not Available
                  </div>
                )}

                {isOwner && (
                  <div className="text-center text-gray-600 py-3">
                    This is your product listing
                  </div>
                )}
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>Posted on {new Date(product.createdAt).toLocaleDateString()}</p>
                {product.updatedAt !== product.createdAt && (
                  <p>Updated on {new Date(product.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
