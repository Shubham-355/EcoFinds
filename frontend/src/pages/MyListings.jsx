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
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <div className="flex space-x-3">
            {selectedProducts.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
              >
                <span>Bulk Actions ({selectedProducts.length})</span>
              </button>
            )}
            <Link
              to="/add-product"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedProducts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-800">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedProducts([]);
                    setShowBulkActions(false);
                  }}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading your products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
            <Link
              to="/add-product"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Your First Product</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Total Listings</h3>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Available</h3>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.isAvailable).length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Sold</h3>
                <p className="text-2xl font-bold text-blue-600">
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
