import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Layout from '../components/Layout';
import EditProductModal from '../components/EditProductModal';

const MyListings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await api.get('/products/user/my-listings');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching my products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    if (!product.isAvailable) {
      alert('Cannot edit sold products');
      return;
    }
    setEditingProduct(product);
  };

  const handleDelete = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product.isAvailable) {
      alert('Cannot delete sold products');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await api.delete(`/products/${productId}`);
        setProducts(products.filter(p => p.id !== productId));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(error.response?.data?.error || 'Failed to delete product');
      }
    }
  };

  const handleEditComplete = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    alert('Product updated successfully!');
  };

  const handleMarkAsSold = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product.isAvailable) {
      alert('Product is already marked as sold');
      return;
    }

    if (window.confirm('Mark this product as sold?')) {
      try {
        await api.put(`/products/${productId}`, { 
          isAvailable: false 
        });
        setProducts(products.map(p => 
          p.id === productId ? { ...p, isAvailable: false } : p
        ));
        alert('Product marked as sold successfully!');
      } catch (error) {
        console.error('Error marking product as sold:', error);
        alert(error.response?.data?.error || 'Failed to mark product as sold');
      }
    }
  };

  const handleMarkAsAvailable = async (productId) => {
    if (window.confirm('Mark this product as available for sale?')) {
      try {
        await api.put(`/products/${productId}`, { 
          isAvailable: true 
        });
        setProducts(products.map(p => 
          p.id === productId ? { ...p, isAvailable: true } : p
        ));
        alert('Product marked as available successfully!');
      } catch (error) {
        console.error('Error marking product as available:', error);
        alert(error.response?.data?.error || 'Failed to mark product as available');
      }
    }
  };

  const handleDuplicate = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const duplicatedProduct = {
      title: `${product.title} (Copy)`,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
    };

    try {
      // For now, we'll navigate to add product page with pre-filled data
      // In a real app, you might want to create a duplicate endpoint
      localStorage.setItem('duplicateProduct', JSON.stringify(duplicatedProduct));
      window.location.href = '/add-product';
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('Failed to duplicate product');
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkDelete = async () => {
    const availableProducts = selectedProducts.filter(id => {
      const product = products.find(p => p.id === id);
      return product?.isAvailable;
    });

    if (availableProducts.length === 0) {
      alert('No available products selected for deletion');
      return;
    }

    if (window.confirm(`Delete ${availableProducts.length} selected products? This action cannot be undone.`)) {
      try {
        await Promise.all(availableProducts.map(id => api.delete(`/products/${id}`)));
        setProducts(products.filter(p => !availableProducts.includes(p.id)));
        setSelectedProducts([]);
        setShowBulkActions(false);
        alert(`${availableProducts.length} products deleted successfully!`);
      } catch (error) {
        console.error('Error deleting products:', error);
        alert('Failed to delete some products');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black text-black bg-primary p-4 border-4 border-black shadow-brutal">
            My Listings
          </h1>
          <div className="flex space-x-3">
            {selectedProducts.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-bg-secondary text-black px-4 py-2 border-3 border-black shadow-brutal hover:bg-primary flex items-center space-x-2 font-black"
              >
                <span>Bulk Actions ({selectedProducts.length})</span>
              </button>
            )}
            <Link
              to="/add-product"
              className="bg-primary text-black px-4 py-2 border-3 border-black shadow-brutal hover:bg-secondary flex items-center space-x-2 font-black"
            >
              <Plus size={20} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedProducts.length > 0 && (
          <div className="bg-secondary border-4 border-black shadow-brutal p-4">
            <div className="flex items-center justify-between">
              <span className="text-black font-black">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-300 text-black px-3 py-1 border-2 border-black shadow-brutal-sm text-sm hover:bg-red-400 font-bold"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedProducts([]);
                    setShowBulkActions(false);
                  }}
                  className="bg-bg-secondary text-black px-3 py-1 border-2 border-black shadow-brutal-sm text-sm hover:bg-bg-primary font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 bg-bg-secondary border-4 border-black shadow-brutal">
            <div className="text-2xl font-black text-black">Loading your products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary border-4 border-black shadow-brutal">
            <p className="text-black mb-4 font-bold text-lg">You haven't listed any products yet.</p>
            <Link
              to="/add-product"
              className="bg-primary text-black px-4 py-2 border-3 border-black shadow-brutal hover:bg-secondary inline-flex items-center space-x-2 font-black"
            >
              <Plus size={20} />
              <span>Add Your First Product</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 border-4 border-black shadow-brutal">
                <h3 className="text-sm font-black text-black bg-bg-secondary p-1 border border-black">Total Listings</h3>
                <p className="text-2xl font-black text-black bg-primary p-2 border-2 border-black mt-2">{products.length}</p>
              </div>
              <div className="bg-white p-4 border-4 border-black shadow-brutal">
                <h3 className="text-sm font-black text-black bg-bg-secondary p-1 border border-black">Available</h3>
                <p className="text-2xl font-black text-black bg-primary p-2 border-2 border-black mt-2">
                  {products.filter(p => p.isAvailable).length}
                </p>
              </div>
              <div className="bg-white p-4 border-4 border-black shadow-brutal">
                <h3 className="text-sm font-black text-black bg-bg-secondary p-1 border border-black">Sold</h3>
                <p className="text-2xl font-black text-black bg-secondary p-2 border-2 border-black mt-2">
                  {products.filter(p => !p.isAvailable).length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showActions={true}
                  showSelection={true}
                  isSelected={selectedProducts.includes(product.id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMarkAsSold={handleMarkAsSold}
                  onMarkAsAvailable={handleMarkAsAvailable}
                  onDuplicate={handleDuplicate}
                  onSelect={handleSelectProduct}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleEditComplete}
        />
      )}
    </Layout>
  );
};

export default MyListings;
