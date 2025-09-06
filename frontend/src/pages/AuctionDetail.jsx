import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel, Clock, DollarSign, User, Trophy, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

const AuctionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    fetchAuctionDetails();
    const interval = setInterval(fetchBids, 3000); // Refresh bids every 3 seconds for live updates
    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (auction) {
      const timer = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [auction]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data.auction);
      setBids(response.data.auction.bids || []);
      
      // Set initial bid amount to minimum next bid
      const currentBid = response.data.auction.currentBid || response.data.auction.startingBid;
      setBidAmount((currentBid + 1).toString());
    } catch (error) {
      console.error('Error fetching auction:', error);
      if (error.response?.status === 404) {
        navigate('/auctions');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await api.get(`/auctions/${id}/bids`);
      setBids(response.data.bids || []);
      
      // Update current bid in auction state
      if (response.data.bids && response.data.bids.length > 0) {
        const highestBid = response.data.bids[0].amount;
        setAuction(prev => prev ? { ...prev, currentBid: highestBid } : null);
        setBidAmount((highestBid + 1).toString());
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const updateTimeLeft = () => {
    if (!auction) return;
    
    const now = new Date().getTime();
    const startTime = new Date(auction.startTime).getTime();
    const endTime = new Date(auction.endTime).getTime();
    
    let timeString = '';
    
    if (now < startTime) {
      const distance = startTime - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      timeString = `Starts in ${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (now >= startTime && now < endTime) {
      const distance = endTime - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      if (days > 0) {
        timeString = `${days}d ${hours}h ${minutes}m left`;
      } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m ${seconds}s left`;
      } else {
        timeString = `${minutes}m ${seconds}s left`;
      }
    } else {
      timeString = 'Auction Ended';
    }
    
    setTimeLeft(timeString);
  };

  const placeBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    const currentHighest = auction.currentBid || auction.startingBid;
    if (parseFloat(bidAmount) <= currentHighest) {
      alert(`Bid must be higher than $${currentHighest}`);
      return;
    }

    setBidding(true);
    try {
      await api.post(`/auctions/${id}/bid`, {
        amount: parseFloat(bidAmount)
      });
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50 animate-bounce-slow';
      notification.textContent = 'Bid placed successfully!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
      // Fetch updated bids immediately
      fetchBids();
      fetchAuctionDetails();
    } catch (error) {
      console.error('Error placing bid:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
      notification.textContent = error.response?.data?.error || 'Failed to place bid';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setBidding(false);
    }
  };

  const approveBid = async (bidId) => {
    if (!window.confirm('Approve this bid and end the auction?')) return;
    
    try {
      await api.post(`/auctions/${id}/approve-bid/${bidId}`);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
      notification.textContent = 'Bid approved! Auction ended.';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      
      fetchAuctionDetails();
    } catch (error) {
      console.error('Error approving bid:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-300 text-black px-4 py-2 brutal-border shadow-brutal font-bold rounded-brutal z-50';
      notification.textContent = error.response?.data?.error || 'Failed to approve bid';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  const getAuctionStatus = () => {
    if (!auction) return 'UNKNOWN';
    
    const now = new Date().getTime();
    const startTime = new Date(auction.startTime).getTime();
    const endTime = new Date(auction.endTime).getTime();
    
    if (now < startTime) return 'SCHEDULED';
    if (now >= startTime && now < endTime) return 'LIVE';
    return 'ENDED';
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'bg-bg-secondary text-black',
      LIVE: 'bg-red-300 text-black animate-pulse',
      ENDED: 'bg-gray-300 text-black'
    };
    return colors[status] || 'bg-white text-black';
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-primary p-4 brutal-border shadow-brutal inline-block rounded-brutal animate-pulse">
            Loading auction details...
          </div>
        </div>
      </Layout>
    );
  }

  if (!auction) {
    return (
      <Layout>
        <div className="text-center py-12">Auction not found</div>
      </Layout>
    );
  }

  const isOwner = user && auction.user && user.id === auction.user.id;
  const auctionStatus = getAuctionStatus();
  const canBid = !isOwner && auctionStatus === 'LIVE';
  const highestBid = bids.length > 0 ? bids[0] : null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-black bg-bg-secondary p-2 brutal-border shadow-brutal-sm hover:bg-primary font-bold rounded-brutal-sm"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white brutal-border shadow-brutal overflow-hidden rounded-brutal">
          <div className="md:flex">
            {/* Image Section */}
            <div className="md:w-1/2 border-r-2 border-black flex items-center justify-center bg-bg-secondary">
              <img
                src={auction.image || '/api/placeholder/600/400'}
                alt={auction.title}
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            
            {/* Details Section */}
            <div className="md:w-1/2 p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-black text-black bg-primary p-2 brutal-border shadow-brutal-sm rounded-brutal-sm">
                  {auction.title}
                </h1>
                <span className={`px-3 py-1 brutal-border text-sm font-black rounded-brutal ${getStatusColor(auctionStatus)}`}>
                  {auctionStatus === 'LIVE' && '🔴'} {auctionStatus}
                </span>
              </div>

              {/* Bidding Status */}
              <div className="mb-4 p-3 bg-bg-secondary brutal-border shadow-brutal-sm rounded-brutal">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-black">Current Bid:</span>
                  <span className="text-xl font-black text-black bg-primary p-2 brutal-border rounded-brutal-sm">
                    ${auction.currentBid || auction.startingBid}
                  </span>
                </div>
                {auction.reservePrice && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-black">Reserve Price:</span>
                    <span className="text-sm font-black text-black bg-warning p-1 brutal-border rounded-brutal-xs">
                      ${auction.reservePrice}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-black">Total Bids:</span>
                  <span className="text-sm font-black text-black bg-secondary p-1 brutal-border rounded-brutal-xs">
                    {bids.length}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="mb-4 p-3 bg-bg-primary brutal-border shadow-brutal-sm rounded-brutal">
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span className="font-black text-black">{timeLeft}</span>
                </div>
              </div>

              {/* Bidding Form */}
              {canBid && (
                <div className="mb-4">
                  <form onSubmit={placeBid} className="space-y-3">
                    <div>
                      <label className="block text-sm font-black text-black mb-2 bg-warning px-2 py-1 brutal-border rounded-brutal inline-block">
                        YOUR BID ($)
                      </label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={((auction.currentBid || auction.startingBid) + 0.01).toString()}
                        step="0.01"
                        className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-bg-primary focus:outline-none focus:bg-white font-bold rounded-brutal"
                        placeholder={`Minimum: $${(auction.currentBid || auction.startingBid) + 1}`}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={bidding}
                      className="w-full bg-primary text-black py-3 px-4 brutal-border shadow-brutal hover:bg-secondary hover:shadow-brutal-lg hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 font-black transition-all rounded-brutal flex items-center justify-center space-x-2"
                    >
                      <Gavel size={16} />
                      <span>{bidding ? 'Placing Bid...' : 'PLACE BID'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-md font-black text-black mb-2 bg-bg-secondary p-2 brutal-border rounded-brutal-sm">Description</h3>
                <p className="text-black leading-relaxed bg-white p-2 brutal-border font-bold rounded-brutal-sm text-sm">{auction.description}</p>
              </div>

              {/* Seller Info */}
              {auction.user && (
                <div className="mb-4 p-3 bg-bg-secondary brutal-border shadow-brutal-sm rounded-brutal-sm">
                  <h3 className="text-md font-black text-black mb-2">Seller Information</h3>
                  <div className="flex items-center space-x-3">
                    {auction.user.profilePhoto ? (
                      <img
                        src={auction.user.profilePhoto}
                        alt={auction.user.username}
                        className="w-8 h-8 brutal-border object-cover rounded-brutal-xs"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-white brutal-border flex items-center justify-center rounded-brutal-xs">
                        <User size={16} className="text-black" />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-black bg-white px-1 py-0.5 rounded-brutal-xs text-sm">{auction.user.username}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category and Dates */}
              <div className="text-xs text-black bg-white p-2 font-bold rounded-brutal-sm space-y-1">
                {auction.category && (
                  <p className="bg-bg-secondary p-1 brutal-border rounded-brutal-xs">
                    Category: {auction.category.name}
                  </p>
                )}
                <p className="bg-bg-secondary p-1 brutal-border rounded-brutal-xs">
                  Starts: {new Date(auction.startTime).toLocaleString()}
                </p>
                <p className="bg-bg-secondary p-1 brutal-border rounded-brutal-xs">
                  Ends: {new Date(auction.endTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Bidding Section */}
        <div className="mt-6 bg-white brutal-border shadow-brutal rounded-brutal">
          <div className="p-4 border-b-2 border-black bg-bg-secondary">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-black flex items-center space-x-2">
                <Eye size={20} />
                <span>Live Bidding {auctionStatus === 'LIVE' && '🔴'}</span>
              </h2>
              {auctionStatus === 'LIVE' && (
                <span className="text-xs bg-red-300 px-2 py-1 brutal-border font-black rounded-brutal animate-pulse">
                  REFRESHING EVERY 3s
                </span>
              )}
            </div>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {bids.length === 0 ? (
              <div className="text-center py-8">
                <Gavel className="mx-auto mb-4" size={32} />
                <p className="text-black font-bold">No bids yet. Be the first to bid!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`p-3 brutal-border rounded-brutal flex items-center justify-between ${
                      index === 0 ? 'bg-primary' : 'bg-bg-secondary'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {index === 0 && <Trophy size={16} className="text-black" />}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-black">
                            ${bid.amount}
                          </span>
                          {index === 0 && (
                            <span className="text-xs bg-red-300 px-1 py-0.5 brutal-border font-black rounded-brutal-xs">
                              HIGHEST
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-black font-bold">
                          by {bid.user.username} • {new Date(bid.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {isOwner && auctionStatus === 'LIVE' && (
                      <button
                        onClick={() => approveBid(bid.id)}
                        className="bg-secondary text-black px-3 py-1 brutal-border shadow-brutal-xs hover:bg-primary text-xs font-black rounded-brutal"
                      >
                        APPROVE & END
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionDetail;
