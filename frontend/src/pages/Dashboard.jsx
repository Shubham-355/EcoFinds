import React, { useState, useEffect } from 'react';
import { User, Edit2, Camera, Mail, Calendar, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    profilePhoto: null,
  });
  const [preview, setPreview] = useState(user?.profilePhoto || '');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/users/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'profilePhoto') {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        profilePhoto: file,
      });
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      if (formData.profilePhoto) {
        submitData.append('profilePhoto', formData.profilePhoto);
      }

      const response = await api.put('/users/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateUser(response.data.user);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <Layout>
        <div className="text-center py-12">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-black text-black bg-primary p-3 brutal-border shadow-brutal-sm rounded-brutal">
          Dashboard
        </h1>

        {/* Profile Section */}
        <div className="bg-white brutal-border shadow-brutal-sm p-4 rounded-brutal">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-black bg-bg-secondary p-2 brutal-border">
              Profile Information
            </h2>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 text-black bg-secondary p-2 brutal-border hover:bg-primary hover:shadow-brutal-sm hover:translate-x-[-1px] hover:translate-y-[-1px] font-bold transition-all rounded-brutal-sm"
            >
              <Edit2 size={14} />
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-bg-secondary brutal-border overflow-hidden rounded-brutal-sm">
                    {preview ? (
                      <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={24} className="text-black" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-secondary text-black p-1 brutal-border cursor-pointer hover:bg-primary hover:shadow-brutal-xs hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all rounded-brutal-xs">
                    <Camera size={12} />
                    <input
                      type="file"
                      name="profilePhoto"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-black text-black mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-white focus:outline-none focus:bg-white font-bold rounded-brutal-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 brutal-border shadow-brutal-xs bg-white focus:outline-none focus:bg-white font-bold rounded-brutal-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-3 py-2  shadow-brutal-xs text-black bg-bg-secondary hover:bg-bg-primary hover:shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 font-bold transition-all rounded-brutal-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 bg-primary text-black brutal-border shadow-brutal-xs hover:bg-secondary hover:shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 font-black transition-all rounded-brutal-sm"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-bg-secondary brutal-border overflow-hidden shadow-brutal-xs hover:shadow-brutal-sm transition-all rounded-brutal-sm">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={24} className="text-black" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-black bg-primary p-2 shadow-brutal-xs rounded-brutal-sm">{user?.username}</h3>
                <div className="flex items-center space-x-2 text-black font-bold">
                  <Mail size={14} />
                  <span className="bg-bg-secondary p-1  rounded-brutal-xs text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-black font-bold">
                  <Calendar size={14} />
                  <span className="bg-bg-secondary p-1  rounded-brutal-xs text-sm">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative bg-white brutal-border shadow-brutal-sm p-4 hover:shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-black bg-bg-secondary p-1 rounded-brutal-xs">Total Listings</p>
                  <p className="text-xl font-black text-black bg-primary p-2 mt-2 shadow-brutal-xs rounded-brutal-sm">{stats.totalListings}</p>
                </div>
                <div className="p-2 bg-bg-secondary rounded-brutal-sm">
                  <Package className="h-5 w-5 text-black" />
                </div>
              </div>
              {stats.totalListings > 0 && (
                <span className="notification-count bg-secondary text-black">
                  {stats.totalListings > 99 ? '99+' : stats.totalListings}
                </span>
              )}
            </div>

            <div className="relative bg-white brutal-border shadow-brutal-sm p-4 hover:shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-black bg-bg-secondary p-1 rounded-brutal-xs">Total Orders</p>
                  <p className="text-xl font-black text-black bg-white p-2 mt-2 shadow-brutal-xs rounded-brutal-sm">{stats.totalOrders}</p>
                </div>
                <div className="p-2 bg-bg-secondary rounded-brutal-sm">
                  <Package className="h-5 w-5 text-black" />
                </div>
              </div>
              {stats.totalOrders > 0 && (
                <span className="notification-count bg-primary text-black">
                  {stats.totalOrders > 99 ? '99+' : stats.totalOrders}
                </span>
              )}
            </div>

            <div className="relative bg-white brutal-border shadow-brutal-sm p-4 hover:shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-black bg-bg-secondary p-1 rounded-brutal-xs">Total Revenue</p>
                  <p className="text-xl font-black text-black bg-primary p-2 mt-2 shadow-brutal-xs rounded-brutal-sm">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-2 bg-bg-secondary rounded-brutal-sm">
                  <Package className="h-5 w-5 text-black" />
                </div>
              </div>
              {stats.totalRevenue > 0 && (
                <span className="notification-dot bg-success border-black"></span>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
