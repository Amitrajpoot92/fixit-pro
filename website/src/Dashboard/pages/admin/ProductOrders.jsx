import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/admin/AdminLayout';
import { 
  PackageOpen, User, X, Phone, Mail, MapPin, 
  Loader2, Wallet, CreditCard, Banknote, AlertTriangle, Calendar,
  Package, Truck
} from 'lucide-react';
import { collection, onSnapshot, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast, { Toaster } from 'react-hot-toast';

export default function ProductOrders() {
  const [productOrders, setProductOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  
  // 🚀 MODALS STATE
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    // 🛍️ Fetch E-commerce Product Orders (Latest First)
    const qProducts = query(collection(db, 'product_orders'), orderBy('createdAt', 'desc'));
    
    const unsubProducts = onSnapshot(qProducts, async (snap) => {
      const promises = snap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        
        // 🚀 Fetch Live User Data to always have the correct phone/email
        let liveName = data.userName || 'Unknown';
        let livePhone = data.userPhone || 'N/A';
        let liveEmail = data.userEmail || 'N/A';

        if (data.userId) {
          try {
            const userRef = doc(db, 'users', data.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.name) liveName = userData.name;
              if (userData.email) liveEmail = userData.email;
              if (userData.mobile) livePhone = userData.mobile;
              else if (userData.phone) livePhone = userData.phone;
            }
          } catch (error) { 
            console.error(error); 
          }
        }

        // Format Date nicely
        let orderDate = 'N/A';
        if (data.createdAt) {
          orderDate = data.createdAt.toDate().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        return {
          id: docSnap.id, 
          ...data,
          customerName: liveName, 
          customerPhone: livePhone, 
          customerEmail: liveEmail,
          status: data.status || 'Pending',
          orderDate: orderDate
        };
      });
      
      const prods = await Promise.all(promises);
      setProductOrders(prods);
      setLoading(false);
    });

    return () => unsubProducts();
  }, []);

  // ==========================================
  // 🚀 PRODUCT ORDERS FILTERS (FLIPKART STYLE)
  // ==========================================
  // Hide Draft/Failed Orders (which means payment incomplete)
  const validProducts = productOrders.filter(p => p.status !== 'Payment_Pending' && p.status !== 'Payment_Failed' && p.status !== 'Payment_Cancelled');
  
  const pendingProducts = validProducts.filter(p => p.status === 'Pending');
  const processingProducts = validProducts.filter(p => p.status === 'Processing');
  const shippedProducts = validProducts.filter(p => p.status === 'Shipped');
  const deliveredProducts = validProducts.filter(p => p.status === 'Delivered');
  const cancelledProducts = validProducts.filter(p => p.status === 'Cancelled');

  const currentProductsList = activeTab === 'Pending' ? pendingProducts :
                              activeTab === 'Processing' ? processingProducts :
                              activeTab === 'Shipped' ? shippedProducts :
                              activeTab === 'Delivered' ? deliveredProducts : cancelledProducts;

  // Visual Badges
  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (s === 'cancelled') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (s === 'processing') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (s === 'shipped') return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    return 'text-orange-400 bg-orange-500/10 border-orange-500/30'; // Pending
  };

  // 🚀 Update Product Logistics Status Logic
  const handleUpdateProductStatus = async () => {
    if (!selectedOrder || !selectedOrder.data || !newStatus) return;
    setStatusUpdating(true);
    try {
      await updateDoc(doc(db, 'product_orders', selectedOrder.data.id), {
        status: newStatus
      });
      toast.success(`Order successfully marked as ${newStatus}`);
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
    setStatusUpdating(false);
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* 🌟 HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <PackageOpen className="w-8 h-8 text-purple-500" /> E-Commerce Orders
            </h2>
            <p className="text-slate-400 mt-2">Manage accessory orders, customer shipping details, and delivery logistics.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-2 w-fit shadow-xl">
             <Truck size={18} className="text-purple-500" />
             <span className="text-slate-300 font-bold text-sm">Logistics Dashboard</span>
          </div>
        </div>

        {/* 🚀 TABS */}
        <div className="flex flex-row gap-2 mb-6 bg-slate-900 p-1 rounded-2xl w-full overflow-x-auto border border-slate-800 shadow-lg">
          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => {
             const count = tab === 'Pending' ? pendingProducts.length : tab === 'Processing' ? processingProducts.length : tab === 'Shipped' ? shippedProducts.length : tab === 'Delivered' ? deliveredProducts.length : cancelledProducts.length;
             return (
               <button 
                 key={tab} onClick={() => setActiveTab(tab)} 
                 className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white'}`}
               >
                 {tab} {count > 0 && <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">{count}</span>}
               </button>
             );
          })}
        </div>

        {/* 📋 ORDERS TABLE */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-700">
                <tr>
                  <th className="p-4 font-semibold">Order ID & Date</th>
                  <th className="p-4 font-semibold">Customer & Contact</th>
                  <th className="p-4 font-semibold">Items & Value</th>
                  <th className="p-4 font-semibold">Logistics Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" /></td></tr>
                ) : currentProductsList.length === 0 ? (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-500">No {activeTab} orders found.</td></tr>
                ) : (
                  currentProductsList.map(order => {
                    const isPrepaid = order.paymentMode === 'Online';
                    const itemCount = order.productDetails?.length || 0;
                    
                    return (
                      <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        {/* Order Info */}
                        <td className="p-4 align-top">
                          <div className="font-black text-white text-sm mb-1">{order.orderId}</div>
                          <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1"><Calendar size={12}/> {order.orderDate}</div>
                        </td>
                        
                        {/* Customer Info */}
                        <td className="p-4 align-top">
                          <div className="font-bold text-slate-200">{order.customerName}</div>
                          <div className="text-xs text-blue-400 mt-1">{order.customerPhone}</div>
                        </td>

                        {/* Items & Payment */}
                        <td className="p-4 align-top">
                          <div className="font-black text-white text-base mb-1">₹{order.totalAmount} <span className="text-xs text-slate-500 font-medium">({itemCount} Items)</span></div>
                          <span className={`flex items-center gap-1 px-2 py-0.5 w-fit rounded text-[10px] font-bold border ${isPrepaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
                            {isPrepaid ? <CreditCard size={12} /> : <Banknote size={12} />} {isPrepaid ? 'PRE-PAID' : 'COD'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4 align-top">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                            {order.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 align-top flex flex-col justify-start items-end gap-2">
                           <button onClick={() => setSelectedOrder({type: 'view', data: order})} className="w-28 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors shadow-md">
                             <PackageOpen size={12} /> View Details
                           </button>
                           {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                             <button onClick={() => { setSelectedOrder({type: 'update', data: order}); setNewStatus(order.status); setIsStatusModalOpen(true); }} className="w-28 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded transition-colors shadow-lg shadow-purple-900/20">
                               <Truck size={12} /> Update Status
                             </button>
                           )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🚀 MODALS SECTION */}
        {/* ========================================================= */}

        {/* 1. VIEW FULL ORDER DETAILS MODAL */}
        {selectedOrder?.type === 'view' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative animate-in zoom-in duration-200">
              
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-3xl">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2"><Package className="text-purple-500"/> Order: {selectedOrder.data.orderId}</h3>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(selectedOrder.data.status)}`}>
                    {selectedOrder.data.status}
                  </span>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-full"><X size={20} /></button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* ❌ Cancel Reason Alert */}
                {selectedOrder.data.status === 'Cancelled' && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-bold text-sm">Cancelled by: {selectedOrder.data.cancelledBy || 'User'}</p>
                      <p className="text-red-300 text-xs mt-1 font-medium leading-relaxed">Reason: {selectedOrder.data.cancelReason || 'No reason provided'}</p>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-inner">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Items Ordered ({selectedOrder.data.productDetails?.length})</p>
                  {selectedOrder.data.productDetails?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800/50 last:border-0 last:pb-0 last:mb-0">
                       <div className="flex-1 pr-4">
                         <p className="text-sm font-bold text-white line-clamp-2 leading-relaxed">{item.name}</p>
                         <p className="text-xs text-slate-500 mt-1 font-medium">Qty: {item.quantity}  •  Category: {item.category}</p>
                       </div>
                       <p className="text-emerald-400 font-black font-mono text-base">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Delivery & Payment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shipping Address */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1"><MapPin size={12}/> Shipping Details</p>
                    <p className="text-white font-bold text-sm mb-1">{selectedOrder.data.customerName}</p>
                    <p className="text-blue-400 text-xs mb-3 font-semibold"><Phone size={10} className="inline"/> {selectedOrder.data.customerPhone}</p>
                    
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <p className="text-slate-300 text-xs leading-relaxed font-medium">
                        {selectedOrder.data.deliveryAddress ? 
                          `${selectedOrder.data.deliveryAddress.flat}, ${selectedOrder.data.deliveryAddress.area}, \n${selectedOrder.data.deliveryAddress.city} - ${selectedOrder.data.deliveryAddress.pincode}` 
                          : 'Address Details Missing'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment Details */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1"><Wallet size={12}/> Payment Info</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400 text-xs font-bold">Total Billed</span>
                      <span className="text-2xl font-black text-white font-mono">₹{selectedOrder.data.totalAmount}</span>
                    </div>
                    
                    <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold border ${selectedOrder.data.paymentMode === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
                      {selectedOrder.data.paymentMode === 'Online' ? 'PRE-PAID (ONLINE)' : 'CASH ON DELIVERY (COD)'}
                    </span>
                    
                    {selectedOrder.data.transactionId && selectedOrder.data.paymentMode === 'Online' && (
                      <div className="mt-4 pt-3 border-t border-slate-800/50">
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Transaction ID</p>
                        <p className="text-xs text-slate-300 font-mono">{selectedOrder.data.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 2. UPDATE LOGISTICS STATUS MODAL */}
        {isStatusModalOpen && selectedOrder?.type === 'update' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border-t-4 border-purple-500 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200">
              <button onClick={() => {setIsStatusModalOpen(false); setSelectedOrder(null);}} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1.5"><X size={16} /></button>
              
              <h3 className="text-2xl font-black text-white mb-1 flex items-center gap-2"><Truck className="text-purple-400" /> Logistics Update</h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">Order ID: <span className="text-purple-400 font-bold">{selectedOrder.data.orderId}</span></p>

              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Select Shipping Stage</label>
              <div className="relative mb-8">
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)} 
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-4 text-white appearance-none outline-none focus:border-purple-500 font-bold cursor-pointer"
                >
                  <option value="Pending">📦 Pending (New Order)</option>
                  <option value="Processing">⚙️ Processing (Packing)</option>
                  <option value="Shipped">🚚 Shipped (Dispatched)</option>
                  <option value="Delivered">✅ Delivered</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </select>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => {setIsStatusModalOpen(false); setSelectedOrder(null);}} className="flex-1 bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
                <button onClick={handleUpdateProductStatus} disabled={statusUpdating} className="flex-1 bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-500 transition-colors flex items-center justify-center shadow-lg shadow-purple-900/20">
                  {statusUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Notify User'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}