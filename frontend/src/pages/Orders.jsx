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
      pending: 'bg-secondary text-black    ',
      confirmed: 'bg-bg-secondary text-black    ',
      shipped: 'bg-primary text-black    ',
      delivered: 'bg-primary text-black    ',
      cancelled: 'bg-red-300 text-black    ',
    };
    return colors[status] || 'bg-white text-black    ';
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 bg-bg-secondary brutal-border shadow-brutal">
          <div className="text-2xl font-black text-black bg-primary p-4 brutal-border inline-block animate-pulse">Loading orders...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-black mb-6 bg-primary p-4 brutal-border shadow-brutal hover:shadow-brutal-lg hover:translate-x-1 hover:translate-y-1 transition-all rounded-brutal">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary brutal-border shadow-brutal rounded-brutal">
            <div className="bg-primary p-3 brutal-border inline-block mb-4 rounded-brutal">
              <Package className="mx-auto h-16 w-16 text-black" />
            </div>
            <p className="text-black text-lg mb-4 font-bold bg-white p-3 brutal-border rounded-brutal">No orders found</p>
            <Link
              to="/"
              className="bg-primary text-black px-6 py-3 brutal-border shadow-brutal hover:bg-secondary hover:shadow-brutal-lg hover:translate-x-1 hover:translate-y-1 inline-block font-black transition-all rounded-brutal"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white brutal-border shadow-brutal overflow-hidden rounded-brutal">
                <div className="p-6 border-b-2 border-black bg-bg-secondary">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-black text-black bg-primary p-2 rounded-brutal">
                          Order #{order.id}
                        </h3>
                        <span className={`px-2 py-1 brutal-border text-xs font-black rounded-brutal-sm ${
                          order.orderType === 'sale' 
                            ? 'bg-secondary text-black' 
                            : 'bg-primary text-black'
                        }`}>
                          {order.orderType === 'sale' ? 'SALE' : 'PURCHASE'}
                        </span>
                      </div>
                      {order.orderType === 'sale' && (
                        <p className="text-sm text-black mb-2 font-bold">
                          Sold to: <span className="font-black bg-bg-primary p-1 rounded-brutal-sm">{order.buyerName}</span>
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-black font-bold">
                        <div className="flex items-center space-x-1 bg-white p-1 brutal-border rounded-brutal-sm">
                          <Calendar size={16} />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-white p-1 brutal-border rounded-brutal-sm">
                          <DollarSign size={16} />
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 brutal-border text-sm font-black rounded-brutal ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 brutal-border bg-bg-primary rounded-brutal">
                        <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                          <img
                            src={item.product.image || '/api/placeholder/80/80'}
                            alt={item.product.title}
                            className="w-16 h-16 object-cover brutal-border rounded-brutal-sm"
                          />
                        </Link>
                        
                        <div className="flex-1">
                          <Link to={`/product/${item.product.id}`}>
                            <h5 className="font-black text-black hover:bg-primary p-1 rounded-brutal-sm">
                              {item.product.title}
                            </h5>
                          </Link>
                          <div className="flex items-center space-x-2 text-sm text-black mt-1 font-bold">
                            <User size={14} />
                            <span className="bg-bg-secondary p-1 rounded-brutal-sm">
                              {order.orderType === 'sale' ? `sold to ${order.buyerName}` : `by ${item.product.user.username}`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-black font-black bg-secondary p-1 rounded-brutal-sm">
                              ${item.price} × {item.quantity}
                            </span>
                            <span className="font-black bg-primary p-1 brutal-border rounded-brutal-sm">
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
