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
    <div className={`bg-white border-4 border-black shadow-brutal overflow-hidden hover:shadow-brutal-lg transition-all ${
      isSelected ? 'ring-4 ring-primary' : ''
    }`}>
      {showSelection && showActions && isOwner && (
        <div className="p-2 border-b-3 border-black bg-bg-secondary">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(product.id)}
            className="h-5 w-5 border-2 border-black shadow-brutal-sm focus:ring-0"
          />
        </div>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="aspect-w-16 aspect-h-12 bg-bg-secondary border-b-4 border-black">
          <img
            src={product.image || '/api/placeholder/300/200'}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-black text-lg mb-2 hover:bg-primary p-1 border-2 border-black shadow-brutal-sm">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-black text-sm mb-2 font-bold bg-bg-primary p-2 border-2 border-black">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-black text-black bg-primary p-2 border-3 border-black shadow-brutal-sm">
            ${product.price}
          </span>
          <div className="flex flex-col items-end space-y-1">
            {product.category && (
              <span className="bg-bg-secondary text-black px-2 py-1 border-2 border-black text-xs font-bold">
                {product.category.name}
              </span>
            )}
            {!product.isAvailable && (
              <span className="bg-red-300 text-black px-2 py-1 border-2 border-black text-xs font-black">
                SOLD
              </span>
            )}
          </div>
        </div>

        {product.user && (
          <p className="text-sm text-black mb-3 font-bold bg-bg-secondary p-1 border-2 border-black">
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
                  className={`flex-1 py-2 px-3 border-3 border-black shadow-brutal-sm flex items-center justify-center space-x-1 text-sm font-black ${
                    product.isAvailable 
                      ? 'bg-secondary text-black hover:bg-primary' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!product.isAvailable ? 'Cannot edit sold products' : 'Edit product'}
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDuplicate && onDuplicate(product.id)}
                  className="flex-1 py-2 px-3 border-3 border-black shadow-brutal-sm flex items-center justify-center space-x-1 text-sm bg-bg-secondary text-black hover:bg-primary font-black"
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
                    className="flex-1 py-2 px-3 border-3 border-black shadow-brutal-sm flex items-center justify-center space-x-1 text-sm bg-secondary text-black hover:bg-primary font-black"
                    title="Mark as sold"
                  >
                    <span>💰</span>
                    <span>Mark Sold</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onMarkAsAvailable && onMarkAsAvailable(product.id)}
                    className="flex-1 py-2 px-3 border-3 border-black shadow-brutal-sm flex items-center justify-center space-x-1 text-sm bg-primary text-black hover:bg-secondary font-black"
                    title="Mark as available"
                  >
                    <span>🔄</span>
                    <span>Available</span>
                  </button>
                )}

                <button
                  onClick={() => onDelete(product.id)}
                  disabled={!product.isAvailable}
                  className={`flex-1 py-2 px-3 border-3 border-black shadow-brutal-sm flex items-center justify-center space-x-1 text-sm font-black ${
                    product.isAvailable 
                      ? 'bg-red-300 text-black hover:bg-red-400' 
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
                className="w-full bg-primary text-black py-2 px-4 border-3 border-black shadow-brutal hover:bg-secondary flex items-center justify-center space-x-1 font-black"
              >
                <MessageCircle size={16} />
                <span>Chat</span>
              </button>
            )
          )}
          
          {!product.isAvailable && !showActions && (
            <div className="w-full bg-gray-300 text-black py-2 px-4 border-3 border-black text-center font-black">
              Sold Out
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
