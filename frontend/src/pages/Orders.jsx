import React, { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-secondary text-black border-2 border-black',
      confirmed: 'bg-bg-secondary text-black border-2 border-black',
      shipped: 'bg-primary text-black border-2 border-black',
      delivered: 'bg-primary text-black border-2 border-black',
      cancelled: 'bg-red-300 text-black border-2 border-black',
    };
    return colors[status] || 'bg-white text-black border-2 border-black';
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 bg-bg-secondary border-4 border-black shadow-brutal">
          <div className="text-2xl font-black text-black">Loading orders...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-black mb-6 bg-primary p-4 border-4 border-black shadow-brutal">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary border-4 border-black shadow-brutal">
            <Package className="mx-auto h-16 w-16 text-black mb-4" />
            <p className="text-black text-lg mb-4 font-bold">No orders found</p>
            <Link
              to="/"
              className="bg-primary text-black px-6 py-3 border-3 border-black shadow-brutal hover:bg-secondary inline-block font-black"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border-4 border-black shadow-brutal overflow-hidden">
                <div className="p-6 border-b-4 border-black bg-bg-secondary">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-black text-black bg-primary p-2 border-2 border-black">
                          Order #{order.id}
                        </h3>
                        <span className={`px-2 py-1 border-2 border-black text-xs font-black ${
                          order.orderType === 'sale' 
                            ? 'bg-secondary text-black' 
                            : 'bg-primary text-black'
                        }`}>
                          {order.orderType === 'sale' ? 'SALE' : 'PURCHASE'}
                        </span>
                      </div>
                      {order.orderType === 'sale' && (
                        <p className="text-sm text-black mb-2 font-bold">
                          Sold to: <span className="font-black bg-bg-primary p-1 border border-black">{order.buyerName}</span>
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-black font-bold">
                        <div className="flex items-center space-x-1 bg-white p-1 border-2 border-black">
                          <Calendar size={16} />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white p-1 border-2 border-black">
                          <DollarSign size={16} />
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 border-2 border-black text-sm font-black ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-black text-black mb-4 bg-bg-secondary p-2 border-2 border-black">Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 border-3 border-black bg-bg-primary">
                        <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                          <img
                            src={item.product.image || '/api/placeholder/80/80'}
                            alt={item.product.title}
                            className="w-16 h-16 object-cover border-2 border-black"
                          />
                        </Link>
                        
                        <div className="flex-1">
                          <Link to={`/product/${item.product.id}`}>
                            <h5 className="font-black text-black hover:bg-primary p-1 border border-black">
                              {item.product.title}
                            </h5>
                          </Link>
                          <div className="flex items-center space-x-2 text-sm text-black mt-1 font-bold">
                            <User size={14} />
                            <span className="bg-bg-secondary p-1 border border-black">
                              {order.orderType === 'sale' ? `sold to ${order.buyerName}` : `by ${item.product.user.username}`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-black font-black bg-secondary p-1 border-2 border-black">
                              ${item.price} × {item.quantity}
                            </span>
                            <span className="font-black bg-primary p-1 border-2 border-black">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
