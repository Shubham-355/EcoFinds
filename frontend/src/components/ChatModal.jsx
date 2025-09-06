import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ChatModal = ({ productId, sellerId, sellerName, productTitle, originalPrice, onClose, onOrderAgreed }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [productId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/product/${productId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // Determine correct receiver ID
      const receiverId = user.id === sellerId ? 
        // If current user is seller, send to buyer (find a buyer from existing messages)
        messages.find(m => m.senderId !== user.id)?.senderId || sellerId :
        // If current user is buyer, send to seller
        sellerId;

      const response = await api.post('/chat/send', {
        productId,
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
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    try {
      const response = await api.post('/chat/send', {
        productId,
        receiverId: sellerId, // Buyer always sends offers to seller
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
      
      // Find the buyer (original offer sender)
      const originalOffer = messages.find(m => m.id === messageId);
      const buyerId = originalOffer?.senderId;
      
      if (!buyerId) {
        alert('Error: Cannot find buyer information');
        return;
      }
      
      const response = await api.post('/chat/send', {
        productId,
        receiverId: buyerId, // Seller responds to buyer
        content,
        isOfferResponse: true,
        offerAccepted: accept,
        isCounterOffer,
        offerAmount: counterOffer || null,
        originalOfferId: messageId,
      });
      
      setMessages([...messages, response.data.message]);
      
      if (accept) {
        // Get the agreed amount from the original offer
        const agreedPrice = originalOffer?.offerAmount || originalPrice;
        
        // Close chat modal and complete order with agreed price
        // Pass the buyer ID since the seller is completing the order
        setTimeout(() => {
          onOrderAgreed(agreedPrice, buyerId);
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
    const canRespond = !isMyOffer && user.id === sellerId && !message.responded;

    return (
      <div className={`flex ${isMyOffer ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs px-3 py-2 border-2 border-black shadow-brutal-sm ${
          isMyOffer ? 'bg-primary text-black' : 'bg-bg-secondary text-black'
        }`}>
          <div className="flex items-center space-x-1 mb-1">
            <DollarSign size={14} />
            <span className="text-xs font-semibold">
              {message.isCounterOffer ? 'Counter Offer' : 'Offer'}
            </span>
          </div>
          <p className="text-sm">{message.content}</p>
          <p className="text-lg font-bold">${message.offerAmount}</p>
          <p className="text-xs opacity-75 mt-1">
            {new Date(message.createdAt).toLocaleTimeString()}
          </p>
          
          {canRespond && (
            <div className="mt-2 space-y-2">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleOfferResponse(message.id, true)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShowCounter(!showCounter)}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                >
                  Counter
                </button>
                <button
                  onClick={() => handleOfferResponse(message.id, false)}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded"
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
                    className="flex-1 px-2 py-1 text-xs border rounded text-gray-900"
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
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black shadow-brutal max-w-md w-full h-96 flex flex-col">
        <div className="p-4 border-b-4 border-black bg-bg-secondary flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-black">Chat about</h3>
            <p className="text-sm text-black font-bold truncate bg-bg-primary p-1 border border-black">{productTitle}</p>
            <p className="text-xs text-black font-bold">with {sellerName}</p>
            <p className="text-xs text-black font-black bg-primary p-1 border border-black">Listed at ${originalPrice}</p>
          </div>
          <button onClick={onClose} className="text-black hover:bg-red-300 p-1 border-2 border-black bg-red-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-black font-bold bg-bg-secondary p-3 border-2 border-black">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-black bg-bg-secondary p-4 border-2 border-black">
              <MessageCircle className="mx-auto mb-2" size={32} />
              <p className="font-bold">Start a conversation about this product</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                {message.isOffer || message.isCounterOffer ? (
                  <OfferMessage message={message} />
                ) : (
                  <div className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 border-2 border-black shadow-brutal-sm ${
                      message.senderId === user.id
                        ? 'bg-primary text-black'
                        : 'bg-bg-secondary text-black'
                    }`}>
                      <p className="text-sm font-bold">{message.content}</p>
                      <p className="text-xs font-bold mt-1">
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

        <div className="p-4 border-t-4 border-black bg-bg-primary">
          {user.id !== sellerId && (
            <button
              onClick={() => setShowOfferModal(true)}
              className="w-full mb-3 bg-secondary text-black py-2 px-4 border-3 border-black shadow-brutal hover:bg-primary text-sm flex items-center justify-center space-x-1 font-black"
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
              className="flex-1 border-3 border-black px-3 py-2 text-sm focus:outline-none bg-white font-bold"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-primary text-black px-3 py-2 border-3 border-black shadow-brutal-sm hover:bg-secondary disabled:opacity-50 font-black"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white border-4 border-black shadow-brutal p-6 max-w-sm w-full">
            <h3 className="text-lg font-black mb-4 bg-primary p-2 border-2 border-black">Make an Offer</h3>
            <p className="text-sm text-black mb-4 font-bold bg-bg-secondary p-2 border border-black">
              Listed price: <span className="font-black text-black bg-primary p-1 border border-black">${originalPrice}</span>
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
                className="w-full border-3 border-black px-3 py-2 focus:outline-none bg-bg-primary font-bold"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-4 py-2 border-3 border-black text-black bg-bg-secondary hover:bg-bg-primary font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleMakeOffer}
                className="flex-1 px-4 py-2 bg-primary text-black border-3 border-black shadow-brutal-sm hover:bg-secondary font-black"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatModal;