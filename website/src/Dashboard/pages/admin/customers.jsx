import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import AdminLayout from '../../component/admin/AdminLayout';
import { Users, Search, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where("role", "==", "customer"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt descending
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCustomers(data);
    } catch (error) {
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobile?.includes(searchQuery)
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-500" /> Customers Directory
          </h2>
          <p className="text-slate-400 mt-2">View and search through all registered app users.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl mb-8">
          <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 focus-within:border-purple-500 px-4 py-2 transition-colors">
            <Search className="text-slate-500 w-5 h-5 mr-3" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search by name, email, or mobile..." 
              className="w-full bg-transparent p-2 text-white outline-none"
            />
          </div>
        </div>

        {/* LIST VIEW */}
        <div>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="p-4 font-semibold whitespace-nowrap">Customer Name</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Contact Details</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Account Status</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading customers...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-500">
                        {searchQuery ? "No customers match your search." : "No customers registered yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => (
                      <tr key={customer.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-3 whitespace-nowrap">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-black shrink-0">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          {customer.name || 'Unknown User'}
                        </td>
                        <td className="p-4 whitespace-nowrap space-y-1">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone className="w-4 h-4 text-slate-500" /> {customer.mobile || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail className="w-4 h-4 text-slate-500" /> {customer.email || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {customer.isActive ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
                              Active
                            </span>
                          ) : (
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {formatDate(customer.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
