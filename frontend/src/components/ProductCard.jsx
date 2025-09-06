import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Edit, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  showActions = false, 
  showSelection = false,
  isSelected = false,
  onSelect,
  onMarkAsSold,
  onMarkAsAvailable,
  onDuplicate,
  onChatClick 
}) => {
  const { user } = useAuth();
  
  const isOwner = user && product.user && user.id === product.user.id;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      {showSelection && showActions && isOwner && (
        <div className="p-2 border-b">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(product.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="aspect-w-16 aspect-h-12 bg-gray-200">
          <img
            src={product.image || '/api/placeholder/300/200'}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-green-600">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-green-600">
            ${product.price}
          </span>
          <div className="flex flex-col items-end space-y-1">
            {product.category && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {product.category.name}
              </span>
            )}
            {!product.isAvailable && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                SOLD
              </span>
            )}
          </div>
        </div>

        {product.user && (
          <p className="text-sm text-gray-500 mb-3">
            by {product.user.username}
          </p>
        )}
        
        <div className="flex flex-col space-y-2">
          {showActions && isOwner ? (
            <>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(product)}
                  disabled={!product.isAvailable}
                  className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 text-sm ${
                    product.isAvailable 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!product.isAvailable ? 'Cannot edit sold products' : 'Edit product'}
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDuplicate && onDuplicate(product.id)}
                  className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 text-sm bg-purple-600 text-white hover:bg-purple-700"
                  title="Duplicate product"
                >
                  <span>📋</span>
                  <span>Copy</span>
                </button>
              </div>

              <div className="flex space-x-2">
                {product.isAvailable ? (
                  <button
                    onClick={() => onMarkAsSold && onMarkAsSold(product.id)}
                    className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 text-sm bg-orange-600 text-white hover:bg-orange-700"
                    title="Mark as sold"
                  >
                    <span>💰</span>
                    <span>Mark Sold</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onMarkAsAvailable && onMarkAsAvailable(product.id)}
                    className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 text-sm bg-green-600 text-white hover:bg-green-700"
                    title="Mark as available"
                  >
                    <span>🔄</span>
                    <span>Available</span>
                  </button>
                )}

                <button
                  onClick={() => onDelete(product.id)}
                  disabled={!product.isAvailable}
                  className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 text-sm ${
                    product.isAvailable 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!product.isAvailable ? 'Cannot delete sold products' : 'Delete product'}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </>
          ) : (
            !isOwner && product.isAvailable && (
              <button
                onClick={() => onChatClick && onChatClick(product)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center space-x-1"
              >
                <MessageCircle size={16} />
                <span>Chat</span>
              </button>
            )
          )}
          
          {!product.isAvailable && !showActions && (
            <div className="w-full bg-gray-400 text-white py-2 px-4 rounded-md text-center">
              Sold Out
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
