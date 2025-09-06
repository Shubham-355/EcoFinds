import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import ChatModal from '../components/ChatModal';

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setChats(response.data.conversations);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleOrderAgreed = async (agreedPrice = null, buyerId = null) => {
    try {
      const payload = {
        productId: selectedChat.product.id,
      };
      
      if (agreedPrice) {
        payload.agreedPrice = agreedPrice;
      }
      
      if (buyerId) {
        payload.buyerId = buyerId;
      }
      
      await api.post('/orders/checkout-direct', payload);
      alert('Order completed successfully!');
      setSelectedChat(null);
      fetchChats();
    } catch (error) {
      console.error('Error completing order:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to complete order: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading messages...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

        {chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No conversations yet</p>
            <Link
              to="/"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 inline-block"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={chat.product.image || '/api/placeholder/80/80'}
                    alt={chat.product.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{chat.product.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <User size={14} />
                      <span>with {chat.otherUser.username}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>
                        {chat.lastMessage 
                          ? new Date(chat.lastMessage.createdAt).toLocaleDateString()
                          : 'New'
                        }
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600 mt-1 block">
                      ${chat.product.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedChat && (
          <ChatModal
            productId={selectedChat.product.id}
            sellerId={selectedChat.product.user.id}
            sellerName={selectedChat.product.user.username}
            productTitle={selectedChat.product.title}
            originalPrice={selectedChat.product.price}
            onClose={() => setSelectedChat(null)}
            onOrderAgreed={handleOrderAgreed}
          />
        )}
      </div>
    </Layout>
  );
};

export default Messages;
