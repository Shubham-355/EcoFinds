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
        <h1 className="text-4xl font-black text-black mb-6 bg-primary p-4 border-4   shadow-brutal hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
          Messages
        </h1>

        {chats.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary border-4   shadow-brutal">
            <div className="bg-primary p-3     inline-block mb-4">
              <MessageCircle className="mx-auto h-16 w-16 text-black" />
            </div>
            <p className="text-black text-lg mb-4 font-bold bg-white p-3    ">No conversations yet</p>
            <Link
              to="/"
              className="bg-primary text-black px-6 py-3 border-3   shadow-brutal hover:bg-secondary hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] inline-block font-black transition-all"
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
                className="bg-white border-4   shadow-brutal p-4 hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer hover:bg-bg-primary"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={chat.product.image || '/api/placeholder/80/80'}
                    alt={chat.product.title}
                    className="w-16 h-16 object-cover    "
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-black text-black bg-bg-secondary p-2     mb-2">{chat.product.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-black mt-1 font-bold">
                      <User size={14} />
                      <span className="bg-bg-primary p-1 border  ">with {chat.otherUser.username}</span>
                    </div>
                    <p className="text-sm text-black mt-1 truncate font-bold bg-white p-2 border  ">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-xs text-black font-bold bg-bg-secondary p-2 border   mb-2">
                      <Clock size={12} />
                      <span>
                        {chat.lastMessage 
                          ? new Date(chat.lastMessage.createdAt).toLocaleDateString()
                          : 'New'
                        }
                      </span>
                    </div>
                    <span className="text-lg font-black text-black bg-primary p-2     block shadow-brutal-sm">
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
