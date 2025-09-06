import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your eco-shopping assistant. I can help you find sustainable products, answer questions about our marketplace, or provide recommendations. What are you looking for today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/chatbot/suggestions');
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/chat', { message });
      
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.data.response.text,
        products: response.data.response.products || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductView = (product) => {
    navigate(`/product/${product.id}`);
    onClose();
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      // You might want to show a success notification here
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-end justify-end p-4">
      <div className="bg-white brutal-border shadow-brutal w-96 h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 brutal-border brutal-btn-primary bg-primary text-black">
          <div className="flex items-center space-x-2">
            <Bot size={24} />
            <h3 className="font-black">EcoFinds Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:bg-red-300 p-1 brutal-border bg-red-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-primary">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 brutal-border shadow-brutal-sm ${
                message.type === 'user' 
                  ? 'bg-primary text-black' 
                  : 'bg-bg-secondary text-black'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && <Bot size={16} className="mt-1 flex-shrink-0" />}
                  {message.type === 'user' && <User size={16} className="mt-1 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-bold">{message.text}</p>
                    
                    {/* Product cards */}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.products.slice(0, 3).map((product) => (
                          <div key={product.id} className="bg-white brutal-border p-3 text-black">
                            <div className="flex items-start space-x-3">
                              <img
                                src={product.image || '/api/placeholder/60/60'}
                                alt={product.title}
                                className="w-12 h-12 object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black truncate bg-bg-primary p-1 ">{product.title}</h4>
                                <p className="text-xs text-black truncate font-bold">{product.category.name}</p>
                                <p className="text-sm font-black text-black bg-primary p-1 ">${product.price}</p>
                                <div className="flex space-x-1 mt-2">
                                  <button
                                    onClick={() => handleProductView(product)}
                                    className="text-xs bg-secondary text-black px-2 py-1 brutal-border shadow-brutal-sm hover:bg-primary flex items-center space-x-1 font-bold"
                                  >
                                    <Eye size={12} />
                                    <span>View</span>
                                  </button>
                                  {user && (
                                    <button
                                      onClick={() => handleAddToCart(product.id)}
                                      className="text-xs bg-secondary text-black px-2 py-1 brutal-border shadow-brutal-sm hover:bg-primary flex items-center space-x-1 font-bold"
                                    >
                                      <ShoppingCart size={12} />
                                      <span>Add</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-bg-secondary text-black max-w-xs p-3 brutal-border shadow-brutal">
                <div className="flex items-center space-x-2">
                  <Bot size={16} />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-black border border-black animate-bounce"></div>
                    <div className="w-2 h-2 bg-black border border-black animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-black border border-black animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        {suggestions.length > 0 && messages.length === 1 && (
          <div className="px-4 py-2  bg-bg-secondary">
            <p className="text-xs text-black mb-2 font-bold">Quick questions:</p>
            <div className="flex flex-wrap gap-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs bg-white text-black px-2 py-1 brutal-border hover:bg-bg-primary font-bold"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 brutal-border bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me about products..."
              className="flex-1 px-3 py-2 brutal-border focus:outline-none bg-bg-primary text-sm font-bold"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-primary text-black px-3 py-2 brutal-border shadow-brutal-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed font-black"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
