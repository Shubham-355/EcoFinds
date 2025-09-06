import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Clock, Send, DollarSign, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

const Messages = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.product.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const fetchMessages = async (productId) => {
    try {
      const response = await api.get(`/chat/product/${productId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const receiverId = user.id === selectedChat.product.user.id ? 
        messages.find(m => m.senderId !== user.id)?.senderId || selectedChat.product.user.id :
        selectedChat.product.user.id;

      const response = await api.post('/chat/send', {
        productId: selectedChat.product.id,
        receiverId,
        content: newMessage.trim(),
      });
      
      setMessages([...messages, response.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0 || !selectedChat) {
      alert('Please enter a valid offer amount');
      return;
    }

    try {
      const response = await api.post('/chat/send', {
        productId: selectedChat.product.id,
        receiverId: selectedChat.product.user.id,
        content: `I would like to make an offer of $${offerAmount} for this product.`,
        isOffer: true,
        offerAmount: parseFloat(offerAmount),
      });
      
      setMessages([...messages, response.data.message]);
      setShowOfferModal(false);
      setOfferAmount('');
    } catch (error) {
      console.error('Error making offer:', error);
      alert('Failed to make offer');
    }
  };

  const handleOfferResponse = async (messageId, accept, counterOffer = null) => {
    try {
      let content;
      let isCounterOffer = false;
      
      if (accept) {
        content = 'I accept your offer! The order will be completed shortly.';
      } else if (counterOffer) {
        content = `I would like to counter with $${counterOffer}`;
        isCounterOffer = true;
      } else {
        content = 'I decline your offer.';
      }
      
      const originalOffer = messages.find(m => m.id === messageId);
      const buyerId = originalOffer?.senderId;
      
      if (!buyerId) {
        alert('Error: Cannot find buyer information');
        return;
      }
      
      const response = await api.post('/chat/send', {
        productId: selectedChat.product.id,
        receiverId: buyerId,
        content,
        isOfferResponse: true,
        offerAccepted: accept,
        isCounterOffer,
        offerAmount: counterOffer || null,
        originalOfferId: messageId,
      });
      
      setMessages([...messages, response.data.message]);
      
      if (accept) {
        const agreedPrice = originalOffer?.offerAmount || selectedChat.product.price;
        
        setTimeout(async () => {
          try {
            await api.post('/orders/checkout-direct', {
              productId: selectedChat.product.id,
              agreedPrice,
              buyerId,
            });
            alert('Order completed successfully!');
            fetchChats();
          } catch (error) {
            console.error('Error completing order:', error);
            alert('Failed to complete order');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error responding to offer:', error);
      alert('Failed to respond to offer');
    }
  };

  const OfferMessage = ({ message }) => {
    const [counterAmount, setCounterAmount] = useState('');
    const [showCounter, setShowCounter] = useState(false);
    
    const isMyOffer = message.senderId === user.id;
    const canRespond = !isMyOffer && user.id === selectedChat?.product.user.id && !message.responded;

    return (
      <div className={`flex ${isMyOffer ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs px-3 py-2 brutal-border shadow-brutal-xs rounded-brutal-xs ${
          isMyOffer ? 'bg-primary text-black' : 'bg-bg-secondary text-black'
        }`}>
          <div className="flex items-center space-x-1 mb-1">
            <DollarSign size={12} />
            <span className="text-xs font-semibold">
              {message.isCounterOffer ? 'Counter Offer' : 'Offer'}
            </span>
          </div>
          <p className="text-xs font-bold">{message.content}</p>
          <p className="text-sm font-black">${message.offerAmount}</p>
          <p className="text-xs opacity-75 mt-1">
            {new Date(message.createdAt).toLocaleTimeString()}
          </p>
          
          {canRespond && (
            <div className="mt-2 space-y-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleOfferResponse(message.id, true)}
                  className="px-2 py-1 bg-primary text-black text-xs brutal-border shadow-brutal-xs hover:bg-secondary font-bold rounded-brutal-xs"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShowCounter(!showCounter)}
                  className="px-2 py-1 bg-bg-secondary text-black text-xs brutal-border shadow-brutal-xs hover:bg-primary font-bold rounded-brutal-xs"
                >
                  Counter
                </button>
                <button
                  onClick={() => handleOfferResponse(message.id, false)}
                  className="px-2 py-1 bg-red-300 text-black text-xs brutal-border shadow-brutal-xs hover:bg-red-400 font-bold rounded-brutal-xs"
                >
                  Decline
                </button>
              </div>
              
              {showCounter && (
                <div className="flex space-x-1">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(e.target.value)}
                    className="flex-1 px-1 py-1 text-xs brutal-border bg-bg-primary text-black font-bold focus:outline-none rounded-brutal-xs"
                    min="0"
                    step="0.01"
                  />
                  <button
                    onClick={() => {
                      if (counterAmount) {
                        handleOfferResponse(message.id, false, parseFloat(counterAmount));
                        setCounterAmount('');
                        setShowCounter(false);
                      }
                    }}
                    className="px-2 py-1 bg-primary text-black text-xs brutal-border shadow-brutal-xs hover:bg-secondary font-bold rounded-brutal-xs"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          )}
          
          {message.responded && (
            <p className="text-xs opacity-75 mt-1 italic">
              {message.offerAccepted ? 'Accepted' : 'Declined'}
            </p>
          )}
        </div>
      </div>
    );
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
      <div className="max-w-7xl mx-auto h-screen">

        <div className="flex h-5/6 brutal-border shadow-brutal rounded-brutal overflow-hidden">
          {/* Sidebar - Conversations List */}
          <div className="w-1/3 bg-white border-r-2 border-black flex flex-col">
            <div className="p-4 bg-bg-secondary border-b-2 border-black">
              <h2 className="font-black text-black">Conversations</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="mx-auto mb-4" size={32} />
                  <p className="text-black font-bold mb-4">No conversations yet</p>
                  <Link
                    to="/"
                    className="brutal-btn brutal-btn-primary rounded-brutal-sm"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-0">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-bg-primary transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-bg-secondary' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={chat.product.image || '/api/placeholder/40/40'}
                          alt={chat.product.title}
                          className="w-10 h-10 object-cover brutal-border rounded-brutal-xs"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-black truncate">{chat.product.title}</h3>
                          <p className="text-xs text-gray-600 font-semibold">with {chat.otherUser.username}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs font-black bg-primary px-1 py-0.5 brutal-border rounded-brutal-xs">
                            ${chat.product.price}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {chat.lastMessage 
                              ? new Date(chat.lastMessage.createdAt).toLocaleDateString()
                              : 'New'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-bg-secondary border-b-2 border-black">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedChat.product.image || '/api/placeholder/40/40'}
                        alt={selectedChat.product.title}
                        className="w-10 h-10 object-cover brutal-border rounded-brutal-xs"
                      />
                      <div>
                        <h3 className="font-black text-black">{selectedChat.product.title}</h3>
                        <p className="text-sm text-black font-bold">
                          with {selectedChat.otherUser.username} • ${selectedChat.product.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-primary">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="mx-auto mb-4" size={32} />
                      <p className="text-black font-bold">Start a conversation about this product</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id}>
                        {message.isOffer || message.isCounterOffer ? (
                          <OfferMessage message={message} />
                        ) : (
                          <div className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-3 py-2 brutal-border shadow-brutal-xs rounded-brutal-xs ${
                              message.senderId === user.id
                                ? 'bg-primary text-black'
                                : 'bg-bg-secondary text-black'
                            }`}>
                              <p className="text-sm font-bold">{message.content}</p>
                              <p className="text-xs font-semibold mt-1 opacity-75">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t-2 border-black">
                  {user.id !== selectedChat.product.user.id && (
                    <button
                      onClick={() => setShowOfferModal(true)}
                      className="w-full mb-3 bg-secondary text-black py-2 px-3 brutal-border shadow-brutal-xs hover:bg-primary text-sm flex items-center justify-center space-x-2 font-black rounded-brutal-sm"
                    >
                      <DollarSign size={16} />
                      <span>Make Offer</span>
                    </button>
                  )}
                  
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 brutal-border focus:outline-none bg-bg-primary font-bold rounded-brutal-sm"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="bg-primary text-black px-4 py-2 brutal-border shadow-brutal-xs hover:bg-secondary disabled:opacity-50 font-black rounded-brutal-sm"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-bg-primary">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-black text-black mb-2">Select a conversation</h3>
                  <p className="text-black font-bold">Choose a conversation from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Offer Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white brutal-border shadow-brutal p-6 max-w-sm w-full rounded-brutal">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black bg-primary p-2 brutal-border rounded-brutal-sm">Make an Offer</h3>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="text-black hover:bg-red-300 p-1 brutal-border bg-red-200 rounded-brutal-xs"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-black mb-4 font-bold bg-bg-secondary p-2 brutal-border rounded-brutal-sm">
                Listed price: <span className="font-black bg-primary p-1 brutal-border rounded-brutal-xs">${selectedChat?.product.price}</span>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-black text-black mb-2">
                  Your Offer ($)
                </label>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Enter your offer amount"
                  className="w-full brutal-border px-3 py-2 focus:outline-none bg-bg-primary font-bold rounded-brutal-sm"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 px-3 py-2 brutal-border text-black bg-bg-secondary hover:bg-bg-primary font-bold rounded-brutal-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMakeOffer}
                  className="flex-1 px-3 py-2 bg-primary text-black brutal-border shadow-brutal-xs hover:bg-secondary font-black rounded-brutal-sm"
                >
                  Send Offer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
