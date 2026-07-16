import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; 
import AdminLayout from '../../component/admin/AdminLayout';
import { Loader2, Package, MapPin, User, Clock, Mail, Phone } from 'lucide-react'; // 👈 Mail & Phone Added

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch Live Orders
  useEffect(() => {
    // latest order sabse upar dikhega
    const q = query(collection(db, 'product_orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚀 Update Order Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'product_orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Status update failed:", error);
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50';
      case 'Shipped': return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
      case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/50';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Product Orders</h1>
          <p className="text-slate-400 mt-1">Manage e-commerce sales, delivery, and dispatch statuses.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
            <p className="text-slate-400 font-medium">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <Package className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-slate-400 font-medium">No orders received yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6">
                
                {/* 1. Product & Price Info */}
                <div className="flex-1 md:border-r md:border-slate-800 pr-0 md:pr-6">
                  <div className="flex items-start gap-4">
                    <img 
                      src={order.productDetails?.image || 'https://via.placeholder.com/60'} 
                      alt="Product" 
                      className="w-16 h-16 rounded-xl bg-slate-800 object-contain p-2"
                    />
                    <div>
                      <h3 className="font-bold text-white text-lg line-clamp-2">{order.productDetails?.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Qty: <span className="text-white font-semibold">{order.productDetails?.quantity}</span> • Category: {order.productDetails?.category}
                      </p>
                      <p className="text-lg font-black text-purple-400 mt-2">₹{order.totalAmount}</p>
                      <p className="text-xs text-slate-500 uppercase mt-1">Paid via {order.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* 2. User & Delivery Info (Email & Phone Added) */}
                <div className="flex-1 md:border-r md:border-slate-800 pr-0 md:pr-6 flex flex-col gap-4">
                  
                  {/* User Basic Info */}
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-white">{order.userName}</p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <p className="text-xs text-slate-400">{order.userPhone}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <p className="text-xs text-slate-400">{order.userEmail || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-3 border-t border-slate-800 pt-3">
                    <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Delivery Address ({order.deliveryAddress?.type})</p>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                        {order.deliveryAddress?.flat}, {order.deliveryAddress?.area}, <br/>
                        {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Status Action & Meta */}
                <div className="w-full md:w-56 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Order Status</p>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`w-full appearance-none border rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 ${getStatusColor(order.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="mt-6 md:mt-0">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <p className="text-xs font-medium">
                        {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString() : 'Date parsing error'}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Order ID: {order.id}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}