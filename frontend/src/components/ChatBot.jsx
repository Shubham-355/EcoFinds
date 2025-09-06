import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, ShoppingCart, Eye, Maximize2, Minimize2 } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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

  // Add function to format markdown-style text
  const formatMessage = (text) => {
    // Split text by lines and process each line
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Handle bullet points with asterisks
      if (line.trim().startsWith('*') && line.includes('**')) {
        const content = line.replace(/^\*\s*/, '').trim();
        const parts = content.split(/(\*\*.*?\*\*)/g);
        
        return (
          <div key={index} className="flex items-start space-x-2 mb-1">
            <span className="text-primary font-black text-lg leading-none">•</span>
            <div className="flex-1">
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.slice(2, -2);
                  return (
                    <span key={partIndex} className="font-black bg-primary px-1 py-0.5 text-black brutal-border-xs">
                      {boldText}
                    </span>
                  );
                }
                return <span key={partIndex}>{part}</span>;
              })}
            </div>
          </div>
        );
      }
      // Handle regular text with bold formatting
      else if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        
        return (
          <div key={index} className="mb-2">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2);
                return (
                  <span key={partIndex} className="font-black bg-primary px-1 py-0.5 text-black brutal-border-xs">
                    {boldText}
                  </span>
                );
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </div>
        );
      }
      // Handle regular lines
      else if (line.trim()) {
        return (
          <div key={index} className="mb-1">
            {line}
          </div>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-end justify-end p-4">
      <div className={`bg-white brutal-border shadow-brutal flex flex-col transition-all duration-300 ease-in-out ${
        isExpanded 
          ? 'w-full max-w-4xl h-full max-h-[80vh]' 
          : 'w-96 h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 brutal-border brutal-btn-primary bg-primary text-black">
          <div className="flex items-center space-x-2">
            <Bot size={24} />
            <h3 className="font-black">EcoFinds Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleExpand}
              className="text-black hover:bg-secondary p-1 brutal-border bg-bg-primary transition-colors rounded-brutal-xs"
              aria-label={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="text-black hover:bg-red-300 p-1 brutal-border bg-red-200 transition-colors rounded-brutal-xs"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-primary">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 brutal-border shadow-brutal-sm ${
                isExpanded ? 'max-w-lg' : 'max-w-xs'
              } ${
                message.type === 'user' 
                  ? 'bg-primary text-black' 
                  : 'bg-bg-secondary text-black'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && <Bot size={16} className="mt-1 flex-shrink-0" />}
                  {message.type === 'user' && <User size={16} className="mt-1 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="text-sm font-bold">
                      {message.type === 'bot' ? formatMessage(message.text) : message.text}
                    </div>
                    
                    {/* Product cards */}
                    {message.products && message.products.length > 0 && (
                      <div className={`mt-3 ${
                        isExpanded ? 'grid grid-cols-2 gap-2' : 'space-y-2'
                      }`}>
                        {message.products.slice(0, isExpanded ? 6 : 3).map((product) => (
                          <div key={product.id} className="bg-white brutal-border p-3 text-black">
                            <div className="flex items-start space-x-3">
                              <img
                                src={product.image || '/api/placeholder/60/60'}
                                alt={product.title}
                                className={`object-cover ${isExpanded ? 'w-16 h-16' : 'w-12 h-12'}`}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-black truncate bg-bg-primary p-1 ${
                                  isExpanded ? 'text-sm' : 'text-xs'
                                }`}>{product.title}</h4>
                                <p className={`text-black truncate font-bold ${
                                  isExpanded ? 'text-sm' : 'text-xs'
                                }`}>{product.category.name}</p>
                                <p className={`font-black text-black bg-primary p-1 ${
                                  isExpanded ? 'text-base' : 'text-sm'
                                }`}>${product.price}</p>
                                <div className="flex space-x-1 mt-2">
                                  <button
                                    onClick={() => handleProductView(product)}
                                    className={`bg-secondary text-black px-2 py-1 brutal-border shadow-brutal-sm hover:bg-primary flex items-center space-x-1 font-bold ${
                                      isExpanded ? 'text-sm' : 'text-xs'
                                    }`}
                                  >
                                    <Eye size={12} />
                                    <span>View</span>
                                  </button>
                                  {user && (
                                    <button
                                      onClick={() => handleAddToCart(product.id)}
                                      className={`bg-secondary text-black px-2 py-1 brutal-border shadow-brutal-sm hover:bg-primary flex items-center space-x-1 font-bold ${
                                        isExpanded ? 'text-sm' : 'text-xs'
                                      }`}
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
          <div className="px-4 py-2 bg-bg-secondary">
            <p className="text-xs text-black mb-2 font-bold">Quick questions:</p>
            <div className={`flex flex-wrap gap-1 ${isExpanded ? 'grid grid-cols-2' : ''}`}>
              {suggestions.slice(0, isExpanded ? 6 : 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`bg-white text-black px-2 py-1 brutal-border hover:bg-bg-primary font-bold ${
                    isExpanded ? 'text-sm' : 'text-xs'
                  }`}
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
              className={`flex-1 px-3 py-2 brutal-border focus:outline-none bg-bg-primary font-bold ${
                isExpanded ? 'text-base' : 'text-sm'
              }`}
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
