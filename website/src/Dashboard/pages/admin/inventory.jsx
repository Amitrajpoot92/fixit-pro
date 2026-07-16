import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Import for Navigation
import { 
  Search, Trash2, Edit, Package, Smartphone, 
  AlertCircle, Loader2, Image as ImageIcon 
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase'; 
import AdminLayout from '../../component/admin/AdminLayout';

export default function Inventory() {
  const navigate = useNavigate(); // 👈 Initialize Navigate
  const [activeTab, setActiveTab] = useState('New'); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const handleDelete = async (id, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const collectionName = activeTab === 'New' ? 'new_products' : 'refurbished_products';
        await deleteDoc(doc(db, collectionName, id));
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  // 🚀 JUMP TO ADD PRODUCT PAGE IN UPDATE MODE
  const handleEdit = (product) => {
    const collectionName = activeTab === 'New' ? 'new_products' : 'refurbished_products';
    // Navigate to products page with the product data in state
    navigate('/admin/products', { state: { editProduct: product, collectionName: collectionName } });
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Inventory Management</h1>
            <p className="text-slate-400 mt-1">Manage your store's stock, prices, and catalog.</p>
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

        <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-xl mb-6 border border-slate-800 w-full md:w-fit">
          <button
            onClick={() => setActiveTab('New')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
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
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'Refurbished' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Refurbished Devices
          </button>
        </div>

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
                {searchTerm ? 'Try adjusting your search keywords.' : `You haven't added any ${activeTab.toLowerCase()} products yet.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/20 transition-colors">
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
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">₹{product.price}</p>
                        {product.originalPrice && (
                          <p className="text-xs text-slate-500 line-through">₹{product.originalPrice}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 🚀 EDIT BUTTON W/ onClick logic */}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}