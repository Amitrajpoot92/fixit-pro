import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Trash2, Edit, Package, Smartphone, 
  AlertCircle, Loader2, Image as ImageIcon, Plus, Minus,
  AlertOctagon, AlertTriangle, CheckCircle2, RotateCcw
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; 
import AdminLayout from '../../component/admin/AdminLayout';
import toast, { Toaster } from 'react-hot-toast';

export default function Inventory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('New'); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in' | 'low' | 'out'

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const collectionName = activeTab === 'New' ? 'new_products' : 'refurbished_products';
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      const productList = [];
      querySnapshot.forEach((doc) => {
        productList.push({ id: doc.id, ...doc.data() });
      });
      
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStockFilter('all');
    fetchProducts();
  }, [activeTab]);

  // 🚀 Helper to safely resolve product stock
  const getProductStock = (product) => {
    if (typeof product.stock === 'number') return product.stock;
    if (typeof product.quantity === 'number') return product.quantity;
    if (product.stock !== undefined && product.stock !== '') return Number(product.stock) || 0;
    if (product.quantity !== undefined && product.quantity !== '') return Number(product.quantity) || 0;
    if (product.inStock === false) return 0;
    return 10; // Default for older products so they stay in stock until admin changes
  };

  // 🚀 Save Stock to Firestore & Optimistically update UI
  const saveStock = async (productId, newQty) => {
    const finalQty = Math.max(0, parseInt(newQty, 10) || 0);
    const collectionName = activeTab === 'New' ? 'new_products' : 'refurbished_products';

    // Optimistic UI update
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: finalQty, quantity: finalQty, inStock: finalQty > 0 };
      }
      return p;
    }));

    try {
      await updateDoc(doc(db, collectionName, productId), {
        stock: finalQty,
        quantity: finalQty,
        inStock: finalQty > 0,
      });

      if (finalQty === 0) {
        toast.error("Product marked as Out of Stock (Hidden from customer checkout)", { duration: 2500 });
      } else {
        toast.success(`Stock updated: ${finalQty} units`, { duration: 2000 });
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
      toast.error("Failed to update stock in database");
      fetchProducts(); // Rollback
    }
  };

  const handleStockDelta = (productId, currentStock, delta) => {
    const newQty = Math.max(0, currentStock + delta);
    saveStock(productId, newQty);
  };

  const handleDelete = async (id, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const collectionName = activeTab === 'New' ? 'new_products' : 'refurbished_products';
        await deleteDoc(doc(db, collectionName, id));
        setProducts(products.filter(product => product.id !== id));
        toast.success(`"${productName}" deleted successfully`);
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product.");
      }
    }
  };

  // 🚀 JUMP TO ADD PRODUCT PAGE IN UPDATE MODE
  const handleEdit = (product) => {
    const collectionName = activeTab === 'New' ? 'new_products' : 'refurbished_products';
    navigate('/admin/products', { state: { editProduct: product, collectionName: collectionName } });
  };

  // 🚨 STOCK ALERTS METRICS
  const outOfStockItems = products.filter(p => getProductStock(p) === 0);
  const lowStockItems = products.filter(p => {
    const s = getProductStock(p);
    return s > 0 && s <= 5;
  });
  const inStockItems = products.filter(p => getProductStock(p) > 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    const s = getProductStock(product);
    if (stockFilter === 'out') return s === 0;
    if (stockFilter === 'low') return s > 0 && s <= 5;
    if (stockFilter === 'in') return s > 0;
    return true;
  });

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Inventory Management</h1>
            <p className="text-slate-400 mt-1">Real-time stock control, automated order deductions, and out-of-stock alerts.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* 🚨 PROMINENT OUT OF STOCK ALERT BANNER */}
        {outOfStockItems.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-rose-950/20 mb-6 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base flex items-center gap-2">
                  Out of Stock Alert
                  <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
                    {outOfStockItems.length}
                  </span>
                </h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  {outOfStockItems.length === 1 
                    ? `"${outOfStockItems[0].name}" is currently 0 in stock and cannot be purchased by customers.`
                    : `${outOfStockItems.length} products have reached 0 inventory and are marked as "Out of Stock" on the app.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                  stockFilter === 'out' 
                    ? 'bg-rose-600 text-white shadow-rose-600/30' 
                    : 'bg-slate-800 text-rose-300 hover:bg-slate-700 border border-rose-500/30'
                }`}
              >
                {stockFilter === 'out' ? 'Show All Products' : 'Filter Out of Stock Items'}
              </button>
            </div>
          </div>
        )}

        {/* ⚡ LOW STOCK WARNING BANNER */}
        {lowStockItems.length > 0 && stockFilter !== 'out' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20 mb-6">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base flex items-center gap-2">
                  Low Stock Warning
                  <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-black">
                    {lowStockItems.length}
                  </span>
                </h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  {lowStockItems.length} items have 5 or fewer units remaining in stock. Restock soon to prevent order interruptions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                  stockFilter === 'low' 
                    ? 'bg-amber-500 text-slate-950 font-black' 
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
                }`}
              >
                {stockFilter === 'low' ? 'Show All Products' : 'Filter Low Stock Items'}
              </button>
            </div>
          </div>
        )}

        {/* Category Tabs & Quick Stock Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Main Category Tabs */}
          <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-full sm:w-fit">
            <button
              onClick={() => setActiveTab('New')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'New' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              New Parts & Accessories
            </button>
            <button
              onClick={() => setActiveTab('Refurbished')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'Refurbished' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Refurbished Devices
            </button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/70 p-1 rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                stockFilter === 'all' 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                stockFilter === 'in' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              In Stock ({inStockItems.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                stockFilter === 'low' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow' 
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Low Stock ({lowStockItems.length})
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                stockFilter === 'out' 
                  ? 'bg-rose-600 text-white shadow' 
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Out of Stock ({outOfStockItems.length})
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
              <p className="text-slate-400 font-medium">Loading inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
              <p className="text-slate-400 text-sm">
                {searchTerm || stockFilter !== 'all' 
                  ? 'Try adjusting your search keywords or stock filter.' 
                  : `You haven't added any ${activeTab.toLowerCase()} products yet.`}
              </p>
              {stockFilter !== 'all' && (
                <button 
                  onClick={() => setStockFilter('all')} 
                  className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock & Quantity</th>
                    <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map((product) => {
                    const stock = getProductStock(product);
                    const isOut = stock <= 0;

                    return (
                      <tr key={product.id} className="hover:bg-slate-800/20 transition-colors">
                        {/* Product Info */}
                        <td className="px-6 py-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white line-clamp-1">{product.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{product.condition}</p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-700">
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">₹{product.price}</p>
                          {product.originalPrice && (
                            <p className="text-xs text-slate-500 line-through">₹{product.originalPrice}</p>
                          )}
                        </td>

                        {/* 🚀 Stock & Quantity Management */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2 min-w-[210px]">
                            {/* Stock Status Badge */}
                            {isOut ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                Out of Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                In Stock ({stock} units)
                              </span>
                            )}

                            {/* Stepper + Input + Quick Button */}
                            <div className="flex items-center gap-1.5">
                              <button 
                                type="button" 
                                onClick={() => handleStockDelta(product.id, stock, -1)}
                                disabled={stock <= 0}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors shadow-sm"
                                title="Decrease by 1"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <input 
                                type="number" 
                                min="0"
                                value={stock} 
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                  saveStock(product.id, isNaN(val) ? 0 : val);
                                }}
                                className="w-14 text-center bg-slate-950 border border-slate-700 rounded-lg py-1 px-1 text-sm font-bold text-white focus:outline-none focus:border-purple-500 transition-colors"
                                title="Click to type exact stock quantity"
                              />

                              <button 
                                type="button" 
                                onClick={() => handleStockDelta(product.id, stock, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors shadow-sm"
                                title="Increase by 1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              {/* Quick Action: Mark Out of Stock or Restock */}
                              {stock > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => saveStock(product.id, 0)}
                                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30 transition-all ml-1 whitespace-nowrap"
                                  title="Immediately set stock to 0 (Out of Stock)"
                                >
                                  Set 0
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => saveStock(product.id, 10)}
                                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all ml-1 whitespace-nowrap"
                                  title="Quick Restock with 10 units"
                                >
                                  + Restock (10)
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(product)}
                              className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800/50 hover:bg-blue-500/10 rounded-lg transition-colors" 
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
