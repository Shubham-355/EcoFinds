import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onEdit, onDelete, showActions = false, onAddToCart }) => {
  const { user } = useAuth();
  
  const isOwner = user && product.user && user.id === product.user.id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
          {product.category && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
              {product.category.name}
            </span>
          )}
        </div>

        {product.user && (
          <p className="text-sm text-gray-500 mb-3">
            by {product.user.username}
          </p>
        )}
        
        <div className="flex space-x-2">
          {showActions && isOwner ? (
            <>
              <button
                onClick={() => onEdit(product)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-1"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center space-x-1"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          ) : (
            !isOwner && (
              <button
                onClick={() => onAddToCart && onAddToCart(product.id)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center space-x-1"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
