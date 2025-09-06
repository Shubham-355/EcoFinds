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
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-black text-black bg-primary p-4 border-4 border-black shadow-brutal">
          Dashboard
        </h1>

        {/* Profile Section */}
        <div className="bg-white border-4 border-black shadow-brutal p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-black bg-bg-secondary p-2 border-2 border-black">
              Profile Information
            </h2>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 text-black bg-secondary p-2 border-2 border-black shadow-brutal-sm hover:bg-primary font-bold"
            >
              <Edit2 size={16} />
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-bg-secondary border-3 border-black overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={32} className="text-black" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-secondary text-black p-1 border-2 border-black cursor-pointer hover:bg-primary">
                    <Camera size={16} />
                    <input
                      type="file"
                      name="profilePhoto"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-black text-black mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:bg-white font-bold"
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
                      className="w-full px-3 py-2 border-3 border-black shadow-brutal-sm bg-bg-primary focus:outline-none focus:bg-white font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border-3 border-black shadow-brutal-sm text-black bg-bg-secondary hover:bg-bg-primary font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-black border-3 border-black shadow-brutal-sm hover:bg-secondary disabled:opacity-50 font-black"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-bg-secondary border-3 border-black overflow-hidden">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={32} className="text-black" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-black bg-primary p-2 border-2 border-black">{user?.username}</h3>
                <div className="flex items-center space-x-2 text-black font-bold">
                  <Mail size={16} />
                  <span className="bg-bg-secondary p-1 border border-black">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-black font-bold">
                  <Calendar size={16} />
                  <span className="bg-bg-secondary p-1 border border-black">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-4 border-black shadow-brutal p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-black bg-bg-secondary p-1 border border-black">Total Listings</p>
                  <p className="text-2xl font-black text-black bg-primary p-2 border-2 border-black mt-2">{stats.totalListings}</p>
                </div>
                <div className="p-3 bg-bg-secondary border-2 border-black">
                  <Package className="h-6 w-6 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-brutal p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-black bg-bg-secondary p-1 border border-black">Total Orders</p>
                  <p className="text-2xl font-black text-black bg-secondary p-2 border-2 border-black mt-2">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-bg-secondary border-2 border-black">
                  <Package className="h-6 w-6 text-black" />
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-brutal p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-black bg-bg-secondary p-1 border border-black">Total Revenue</p>
                  <p className="text-2xl font-black text-black bg-primary p-2 border-2 border-black mt-2">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-3 bg-bg-secondary border-2 border-black">
                  <Package className="h-6 w-6 text-black" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
