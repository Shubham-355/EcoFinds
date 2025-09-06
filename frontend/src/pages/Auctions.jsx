import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Gavel } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuctionCard from '../components/AuctionCard';
import Layout from '../components/Layout';

const Auctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAuctions();
    fetchCategories();
  }, [searchTerm, selectedCategory, statusFilter, currentPage]);

  const fetchAuctions = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 12,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (statusFilter) params.status = statusFilter;
      
      console.log('Fetching auctions with params:', params);
      
      const response = await api.get('/auctions', { params });
      console.log('Auctions response:', response.data);
      
      setAuctions(response.data.auctions || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      console.error('Error response:', error.response?.data);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuctions();
  };

  const handleAuctionUpdate = () => {
    fetchAuctions();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
            <h1 className="brutal-header text-2xl bg-primary px-6 py-3 shadow-brutal-sm rounded-brutal">
              <Gavel className="inline mr-2" size={24} />
              AUCTION HOUSE
            </h1>
            <Link
              to="/create-auction"
              className="brutal-btn brutal-btn-primary flex items-center space-x-2 rounded-brutal"
            >
              <Plus size={16} />
              <span>CREATE AUCTION</span>
            </Link>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search auctions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="brutal-input w-full pl-10 rounded-brutal"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="brutal-select min-w-[140px] rounded-brutal"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="brutal-select min-w-[120px] rounded-brutal"
              >
                <option value="">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live</option>
                <option value="ENDED">Ended</option>
              </select>
              
              <button
                type="submit"
                className="brutal-btn brutal-btn-secondary flex items-center space-x-2 rounded-brutal"
              >
                <Filter size={14} />
                <span>FILTER</span>
              </button>
            </div>
          </form>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {setStatusFilter(''); setCurrentPage(1);}}
              className={`brutal-btn text-xs rounded-brutal ${!statusFilter ? 'brutal-btn-primary' : 'brutal-btn-secondary'}`}
            >
              All Auctions
            </button>
            <button
              onClick={() => {setStatusFilter('LIVE'); setCurrentPage(1);}}
              className={`brutal-btn text-xs rounded-brutal ${statusFilter === 'LIVE' ? 'brutal-btn-primary' : 'brutal-btn-secondary'}`}
            >
              🔴 Live Now
            </button>
            <button
              onClick={() => {setStatusFilter('SCHEDULED'); setCurrentPage(1);}}
              className={`brutal-btn text-xs rounded-brutal ${statusFilter === 'SCHEDULED' ? 'brutal-btn-primary' : 'brutal-btn-secondary'}`}
            >
              📅 Upcoming
            </button>
            <button
              onClick={() => {setStatusFilter('ENDED'); setCurrentPage(1);}}
              className={`brutal-btn text-xs rounded-brutal ${statusFilter === 'ENDED' ? 'brutal-btn-primary' : 'brutal-btn-secondary'}`}
            >
              ⏰ Ended
            </button>
          </div>

          {/* Auctions Grid */}
          {loading ? (
            <div className="text-center py-12 brutal-card rounded-brutal">
              <div className="text-md font-bold text-black bg-primary px-4 py-2 brutal-border inline-block rounded-brutal shadow-brutal-sm">
                Loading auctions...
              </div>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center space-x-10 py-12 brutal-card rounded-brutal">
              <div className="text-md font-bold text-black bg-bg-secondary px-4 py-2 brutal-border inline-block mb-4 rounded-brutal shadow-brutal-sm">
                No auctions found
              </div>
              <Link 
                to="/create-auction"
                className="brutal-btn brutal-btn-primary rounded-brutal"
              >
                Create First Auction
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {auctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onAuctionUpdate={handleAuctionUpdate}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-1 flex-wrap mt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`brutal-btn px-3 py-1 rounded-brutal text-xs ${
                    currentPage === i + 1
                      ? 'brutal-btn-primary'
                      : 'brutal-btn-secondary'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Auctions;
