import React, { useState, useEffect } from 'react';
import { User, Edit2, Camera, Mail, Calendar } from 'lucide-react';
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <Edit2 size={16} />
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={32} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={32} className="text-gray-500" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">{user?.username}</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={16} />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar size={16} />
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalListings}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Package className="h-6 w-6 text-purple-600" />
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
