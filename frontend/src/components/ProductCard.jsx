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
    <div className={`bg-white brutal-border shadow-brutal-sm overflow-hidden hover:shadow-brutal transition-all rounded-brutal ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      {showSelection && showActions && isOwner && (
        <div className="p-2 border-b-2 border-black bg-bg-secondary">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(product.id)}
            className="h-4 w-4 brutal-border shadow-brutal-xs focus:ring-0"
          />
        </div>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="aspect-w-16 aspect-h-12 bg-bg-secondary border-b-2 border-black">
          <img
            src={product.image || '/api/placeholder/300/200'}
            alt={product.title}
            className="w-full h-36 object-cover"
          />
        </div>
      </Link>
      
      <div className="p-3 bg-bg-primary">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-black text-md mb-2 hover:bg-primary p-1 shadow-brutal-xs transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-brutal-xs">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-black text-xs mb-2 font-bold bg-white p-1 line-clamp-2 rounded-brutal-xs">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-black text-black bg-primary p-1 shadow-brutal-xs brutal-border rounded-brutal-xs">
            ${product.price}
          </span>
          <div className="flex flex-col items-end space-y-1">
            {product.category && (
              <span className="bg-bg-secondary text-black px-1 py-0.5 text-xs font-bold brutal-border rounded-brutal-xs">
                {product.category.name}
              </span>
            )}
            {!product.isAvailable && (
              <span className="bg-red-300 text-black px-1 py-0.5 text-xs font-black brutal-border rounded-brutal-xs">
                SOLD
              </span>
            )}
          </div>
        </div>

        {product.user && (
          <p className="text-xs text-black mb-2 font-bold bg-bg-secondary p-1 rounded-brutal-xs">
            by {product.user.username}
          </p>
        )}
        
        <div className="flex flex-col space-y-1">
          {showActions && isOwner ? (
            <>
              <div className="flex space-x-1">
                <button
                  onClick={() => onEdit(product)}
                  disabled={!product.isAvailable}
                  className={`flex-1 py-1 px-2 brutal-btn text-xs ${
                    product.isAvailable 
                      ? 'brutal-btn-secondary hover:brutal-btn-primary' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed brutal-border'
                  }`}
                  title={!product.isAvailable ? 'Cannot edit sold products' : 'Edit product'}
                >
                  <Edit size={12} className="inline mr-1" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDuplicate && onDuplicate(product.id)}
                  className="flex-1 brutal-btn brutal-btn-secondary text-xs flex items-center justify-center space-x-1"
                  title="Duplicate product"
                >
                  <span>Copy</span>
                </button>
              </div>

              <div className="flex space-x-1">
                {product.isAvailable ? (
                  <button
                    onClick={() => onMarkAsSold && onMarkAsSold(product.id)}
                    className="flex-1 brutal-btn brutal-btn-secondary text-xs flex items-center justify-center space-x-1"
                    title="Mark as sold"
                  >
                    <span>Mark Sold</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onMarkAsAvailable && onMarkAsAvailable(product.id)}
                    className="flex-1 brutal-btn brutal-btn-primary text-xs flex items-center justify-center space-x-1"
                    title="Mark as available"
                  >
                    <span>Available</span>
                  </button>
                )}

                <button
                  onClick={() => onDelete(product.id)}
                  disabled={!product.isAvailable}
                  className={`flex-1 py-1 px-2 text-xs font-black ${
                    product.isAvailable 
                      ? 'bg-red-300 text-black hover:bg-red-400 brutal-border shadow-brutal-xs' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed brutal-border'
                  } rounded-brutal-xs`}
                  title={!product.isAvailable ? 'Cannot delete sold products' : 'Delete product'}
                >
                  <Trash2 size={12} className="inline mr-1" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          ) : (
            !isOwner && product.isAvailable && (
              <button
                onClick={() => onChatClick && onChatClick(product)}
                className="w-full brutal-btn brutal-btn-primary flex items-center justify-center space-x-1"
              >
                <MessageCircle size={12} />
                <span>Chat</span>
              </button>
            )
          )}
          
          {!product.isAvailable && !showActions && (
            <div className="w-full bg-gray-300 text-black py-1 px-2 brutal-border text-center text-xs font-black rounded-brutal-xs">
              Sold Out
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
