import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Layout from '../components/Layout';
import ChatModal from '../components/ChatModal';

const Home = () => {
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

  const handleChatClick = (product) => {
    setSelectedProduct(product);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black text-black bg-primary p-4 border-4 border-black shadow-brutal">
            Browse Products
          </h1>
          <Link
            to="/add-product"
            className="bg-primary text-black px-6 py-3 border-3 border-black shadow-brutal hover:bg-secondary flex items-center space-x-2 font-black"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 border-4 border-black shadow-brutal">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:bg-white font-bold"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-3 border-black shadow-brutal-sm bg-bg-secondary focus:outline-none font-bold"
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
                className="bg-secondary text-black px-6 py-3 border-3 border-black shadow-brutal hover:bg-primary flex items-center space-x-2 font-black"
              >
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>
          </form>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 bg-bg-secondary border-4 border-black shadow-brutal">
            <div className="text-2xl font-black text-black">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary border-4 border-black shadow-brutal">
            <div className="text-2xl font-black text-black">No products found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 border-3 border-black shadow-brutal-sm font-black ${
                  currentPage === i + 1
                    ? 'bg-primary text-black'
                    : 'bg-white text-black hover:bg-bg-secondary'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Chat Modal */}
        {selectedProduct && (
          <ChatModal
            productId={selectedProduct.id}
            sellerId={selectedProduct.user.id}
            sellerName={selectedProduct.user.username}
            productTitle={selectedProduct.title}
            originalPrice={selectedProduct.price}
            onClose={() => setSelectedProduct(null)}
            onOrderAgreed={handleOrderAgreed}
          />
        )}
      </div>
    </Layout>
  );
};

export default Home;
