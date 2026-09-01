import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/admin/AdminLayout';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { RefreshCcw, Search, CheckCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Requested'); // 'Requested', 'Processed', 'All'

  // Combine both collections
  useEffect(() => {
    const qBookings = query(collection(db, 'bookings'), where('refundStatus', 'in', ['Requested', 'Processed']));
    const qOrders = query(collection(db, 'product_orders'), where('refundStatus', 'in', ['Requested', 'Processed']));

    let bookingsData = [];
    let ordersData = [];

    const updateCombined = () => {
      const combined = [...bookingsData, ...ordersData];
      combined.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setRefunds(combined);
      setLoading(false);
    };

    const unsubBookings = onSnapshot(qBookings, (snap) => {
      bookingsData = snap.docs.map(doc => ({ id: doc.id, collection: 'bookings', ...doc.data() }));
      updateCombined();
    });

    const unsubOrders = onSnapshot(qOrders, (snap) => {
      ordersData = snap.docs.map(doc => ({ id: doc.id, collection: 'product_orders', ...doc.data() }));
      updateCombined();
    });

    return () => {
      unsubBookings();
      unsubOrders();
    };
  }, []);

  const handleMarkAsRefunded = async (docId, collectionName) => {
    const isConfirm = window.confirm("Are you sure you have manually sent the money to the user? This action cannot be undone.");
    if (!isConfirm) return;

    try {
      await updateDoc(doc(db, collectionName, docId), {
        refundStatus: 'Processed',
        refundDate: new Date()
      });
      toast.success("Marked as Refunded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    }
  };

  const filteredRefunds = refunds.filter(item => {
    const matchSearch = (item.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.customerName || item.userId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'All') return matchSearch;
    return matchSearch && item.refundStatus === filter;
  });

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <RefreshCcw className="text-emerald-500 w-8 h-8" /> 
              Refund Requests
            </h2>
            <p className="text-slate-400 mt-1">Manage manual refunds for cancelled prepaid orders.</p>
          </div>
          
          <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            {['Requested', 'Processed', 'All'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <Search className="text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent flex-1 outline-none text-white font-medium"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 min-w-[800px]">
              <thead className="bg-slate-950/50 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID & Type</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount & Mode</th>
                  <th className="px-6 py-4">Refund Details (By User)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-500">Loading refunds...</td></tr>
                ) : filteredRefunds.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-500 font-medium">No refunds found.</td></tr>
                ) : (
                  filteredRefunds.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-white text-base">{item.orderId || item.id.substring(0, 8)}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-bold">
                          {item.collection === 'product_orders' ? 'E-Commerce' : 'Service Booking'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{item.customerName || 'N/A'}</div>
                        <div className="text-xs text-slate-500">{item.mobileNo || item.phone || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-black text-emerald-400 text-lg">₹{item.totalAmount}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-bold flex items-center gap-1">
                          {item.paymentMode || item.paymentMethod || 'Online'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-yellow-400 bg-yellow-400/10 p-3 rounded-xl border border-yellow-400/20 whitespace-pre-wrap font-medium">
                          {item.refundDetails || 'No details provided by user.'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.refundStatus === 'Requested' ? (
                          <span className="flex items-center gap-1.5 text-orange-400 font-bold bg-orange-400/10 px-3 py-1.5 rounded-full text-xs w-fit border border-orange-400/20">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1.5 rounded-full text-xs w-fit border border-emerald-400/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Processed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {item.refundStatus === 'Requested' && (
                          <button 
                            onClick={() => handleMarkAsRefunded(item.id, item.collection)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 ml-auto text-xs"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Refunded
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
