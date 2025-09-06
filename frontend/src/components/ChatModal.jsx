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
        <div className={`max-w-xs px-2 py-2 border   shadow-brutal-xs rounded-brutal-xs ${
          isMyOffer ? 'bg-primary text-black' : 'bg-bg-secondary text-black'
        }`}>
          <div className="flex items-center space-x-1 mb-1">
            <DollarSign size={12} />
            <span className="text-xs font-semibold">
              {message.isCounterOffer ? 'Counter Offer' : 'Offer'}
            </span>
          </div>
          <p className="text-xs">{message.content}</p>
          <p className="text-sm font-bold">${message.offerAmount}</p>
          <p className="text-xs opacity-75 mt-1">
            {new Date(message.createdAt).toLocaleTimeString()}
          </p>
          
          {canRespond && (
            <div className="mt-2 space-y-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleOfferResponse(message.id, true)}
                  className="px-1 py-1 bg-primary text-black text-xs border   shadow-brutal-xs hover:bg-secondary font-bold rounded-brutal-xs"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShowCounter(!showCounter)}
                  className="px-1 py-1 bg-bg-secondary text-black text-xs border   shadow-brutal-xs hover:bg-primary font-bold rounded-brutal-xs"
                >
                  Counter
                </button>
                <button
                  onClick={() => handleOfferResponse(message.id, false)}
                  className="px-1 py-1 bg-red-300 text-black text-xs border   shadow-brutal-xs hover:bg-red-400 font-bold rounded-brutal-xs"
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
                    className="flex-1 px-1 py-1 text-xs border   bg-bg-primary text-black font-bold focus:outline-none rounded-brutal-xs"
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
                    className="px-1 py-1 bg-primary text-black text-xs border   shadow-brutal-xs hover:bg-secondary font-bold rounded-brutal-xs"
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
      <div className="bg-white     shadow-brutal max-w-md w-full h-80 flex flex-col rounded-brutal">
        <div className="p-3 border-b-2   bg-bg-secondary flex justify-between items-center rounded-t-brutal">
          <div>
            <h3 className="text-md font-black text-black">Chat about</h3>
            <p className="text-sm text-black font-bold truncate bg-bg-primary p-1 border   rounded-brutal-xs">{productTitle}</p>
            <p className="text-xs text-black font-bold">with {sellerName}</p>
            <p className="text-xs text-black font-black bg-primary p-1 border   rounded-brutal-xs">Listed at ${originalPrice}</p>
          </div>
          <button onClick={onClose} className="text-black hover:bg-red-300 p-1 border   bg-red-200 rounded-brutal-xs">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="text-center text-black font-bold bg-bg-secondary p-2 border   rounded-brutal-xs">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-black bg-bg-secondary p-3 border   rounded-brutal-sm">
              <MessageCircle className="mx-auto mb-2" size={24} />
              <p className="font-bold text-sm">Start a conversation about this product</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                {message.isOffer || message.isCounterOffer ? (
                  <OfferMessage message={message} />
                ) : (
                  <div className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-2 py-2 border   shadow-brutal-xs rounded-brutal-xs ${
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

        <div className="p-3 border-t-2   bg-bg-primary rounded-b-brutal">
          {user.id !== sellerId && (
            <button
              onClick={() => setShowOfferModal(true)}
              className="w-full mb-2 bg-secondary text-black py-2 px-3     shadow-brutal-xs hover:bg-primary text-xs flex items-center justify-center space-x-1 font-black rounded-brutal-xs"
            >
              <DollarSign size={14} />
              <span>Make Offer</span>
            </button>
          )}
          
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1     px-2 py-2 text-xs focus:outline-none bg-white font-bold rounded-brutal-xs"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-primary text-black px-2 py-2     shadow-brutal-xs hover:bg-secondary disabled:opacity-50 font-black rounded-brutal-xs"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white     shadow-brutal p-4 max-w-sm w-full rounded-brutal">
            <h3 className="text-md font-black mb-3 bg-primary p-2 border   rounded-brutal-xs">Make an Offer</h3>
            <p className="text-sm text-black mb-3 font-bold bg-bg-secondary p-2 border   rounded-brutal-xs">
              Listed price: <span className="font-black text-black bg-primary p-1 border   rounded-brutal-xs">${originalPrice}</span>
            </p>
            <div className="mb-3">
              <label className="block text-sm font-black text-black mb-2">
                Your Offer ($)
              </label>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter your offer amount"
                className="w-full     px-2 py-2 focus:outline-none bg-bg-primary font-bold text-sm rounded-brutal-xs"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-3 py-2     text-black bg-bg-secondary hover:bg-bg-primary font-bold text-sm rounded-brutal-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleMakeOffer}
                className="flex-1 px-3 py-2 bg-primary text-black     shadow-brutal-xs hover:bg-secondary font-black text-sm rounded-brutal-xs"
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