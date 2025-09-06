import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gavel, User } from 'lucide-react';

const AuctionCard = ({ auction, onAuctionUpdate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState(auction.status);

  useEffect(() => {
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  const updateTimeLeft = () => {
    const now = new Date().getTime();
    const startTime = new Date(auction.startTime).getTime();
    const endTime = new Date(auction.endTime).getTime();
    
    let timeString = '';
    let currentStatus = status;
    
    if (now < startTime) {
      const distance = startTime - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        timeString = `Starts in ${days}d ${hours}h`;
      } else {
        timeString = `Starts in ${hours}h ${minutes}m`;
      }
      currentStatus = 'SCHEDULED';
    } else if (now >= startTime && now < endTime) {
      const distance = endTime - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        timeString = `${days}d ${hours}h left`;
      } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m left`;
      } else {
        timeString = `${minutes}m left`;
      }
      currentStatus = 'LIVE';
    } else {
      timeString = 'Ended';
      currentStatus = 'ENDED';
    }
    
    setTimeLeft(timeString);
    if (currentStatus !== status) {
      setStatus(currentStatus);
      if (onAuctionUpdate) onAuctionUpdate();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'bg-bg-secondary text-black',
      LIVE: 'bg-red-300 text-black animate-pulse',
      ENDED: 'bg-gray-300 text-black'
    };
    return colors[status] || 'bg-white text-black';
  };

  const currentBid = auction._count?.bids > 0 ? auction.currentBid || auction.startingBid : auction.startingBid;
  const bidCount = auction._count?.bids || 0;

  return (
    <div className="bg-white brutal-border shadow-brutal hover:shadow-brutal-lg hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal overflow-hidden">
      <div className="relative">
        <Link to={`/auction/${auction.id}`}>
          <img
            src={auction.image || '/api/placeholder/300/200'}
            alt={auction.title}
            className="w-full h-48 object-cover"
          />
        </Link>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 brutal-border text-xs font-black rounded-brutal ${getStatusColor(status)}`}>
            {status === 'LIVE' && '🔴'} {status}
          </span>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/auction/${auction.id}`}>
          <h3 className="font-black text-black text-lg hover:bg-primary p-1 rounded-brutal-sm truncate">
            {auction.title}
          </h3>
        </Link>

        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-black bg-bg-secondary px-2 py-1 brutal-border rounded-brutal-xs">
              Current Bid:
            </span>
            <span className="font-black text-black bg-primary px-2 py-1 brutal-border rounded-brutal-sm">
              ${currentBid}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Gavel size={12} />
              <span className="text-xs font-bold text-black">
                {bidCount} bid{bidCount !== 1 ? 's' : ''}
              </span>
            </div>
            {auction.reservePrice && (
              <span className="text-xs bg-warning px-1 py-0.5 brutal-border font-bold rounded-brutal-xs">
                Reserve: ${auction.reservePrice}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <Clock size={12} />
            <span className="font-bold text-black bg-bg-primary px-1 py-0.5 brutal-border rounded-brutal-xs">
              {timeLeft}
            </span>
          </div>

          {auction.user && (
            <div className="flex items-center space-x-2">
              <User size={12} />
              <span className="text-xs font-bold text-black bg-white px-1 py-0.5 brutal-border rounded-brutal-xs">
                by {auction.user.username}
              </span>
            </div>
          )}

          {auction.category && (
            <div className="text-xs">
              <span className="bg-bg-secondary px-1 py-0.5 brutal-border font-bold rounded-brutal-xs">
                {auction.category.name}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <Link
            to={`/auction/${auction.id}`}
            className={`w-full px-3 py-2 brutal-border shadow-brutal-xs hover:shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] font-black text-sm transition-all rounded-brutal flex items-center justify-center space-x-2 ${
              status === 'LIVE' 
                ? 'bg-red-300 text-black hover:bg-red-400' 
                : status === 'SCHEDULED'
                ? 'bg-secondary text-black hover:bg-primary'
                : 'bg-gray-300 text-black hover:bg-gray-400'
            }`}
          >
            <Gavel size={14} />
            <span>
              {status === 'LIVE' ? 'BID NOW' : status === 'SCHEDULED' ? 'VIEW AUCTION' : 'VIEW RESULTS'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
