import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Layout from '../components/Layout';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, selectedCategory, currentPage]);

  const fetchProducts = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 12,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await api.get('/products', { params });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleChatClick = async (product) => {
    try {
      // Create initial message to start conversation
      await api.post('/chat/send', {
        productId: product.id,
        receiverId: product.user.id,
        content: `Hi! I'm interested in your product: ${product.title}`,
      });
      
      // Navigate to messages page
      navigate('/messages');
    } catch (error) {
      console.error('Error starting chat:', error);
      // If error, still navigate to messages page
      navigate('/messages');
    }
  };

  const handleOrderAgreed = async (agreedPrice = null, buyerId = null) => {
    try {
      const payload = {
        productId: selectedProduct.id,
      };
      
      if (agreedPrice) {
        payload.agreedPrice = agreedPrice;
      }
      
      if (buyerId) {
        payload.buyerId = buyerId;
      }
      
      await api.post('/orders/checkout-direct', payload);
      alert('Order completed successfully!');
      setSelectedProduct(null);
      // Navigate to orders page instead of refreshing products
      window.location.href = '/orders';
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
            <h1 className="brutal-header text-2xl bg-primary px-6 py-3 shadow-brutal-sm rounded-brutal">
              BROWSE PRODUCTS
            </h1>
            <Link
              to="/add-product"
              className="brutal-btn brutal-btn-primary flex items-center space-x-2 rounded-brutal"
            >
              <Plus size={16} />
              <span>ADD PRODUCT</span>
            </Link>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="brutal-input w-full pl-10 rounded-brutal"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="brutal-select min-w-[140px] rounded-brutal"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <button
                type="submit"
                className="brutal-btn brutal-btn-secondary flex items-center space-x-2 rounded-brutal"
              >
                <Filter size={14} />
                <span>FILTER</span>
              </button>
            </div>
          </form>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12 brutal-card rounded-brutal">
              <div className="text-md font-bold text-black bg-primary px-4 py-2     inline-block rounded-brutal shadow-brutal-sm">
                Loading products...
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 brutal-card rounded-brutal">
              <div className="text-md font-bold text-black bg-gray-100 px-4 py-2     inline-block mb-4 rounded-brutal shadow-brutal-sm">
                No products found
              </div>
              <Link 
                to="/add-product"
                className="brutal-btn brutal-btn-primary rounded-brutal"
              >
                Add First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onChatClick={handleChatClick}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-1 flex-wrap mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`brutal-btn px-3 py-1 rounded-brutal text-xs ${
                    currentPage === i + 1
                      ? 'brutal-btn-primary'
                      : 'brutal-btn-secondary'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Chat Modal */}
          {/* Removed - chat now happens in Messages page */}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
