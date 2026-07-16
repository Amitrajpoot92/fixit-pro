import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 👈 Edit info lene aur wapas bhejane ke liye
import { UploadCloud, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, X, Plus, Edit, Trash2, Settings, ArrowLeft } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase'; 
import AdminLayout from '../../component/admin/AdminLayout';

const IMAGEKIT_PRIVATE_KEY = "private_x77JBMB4vB985OM8bOdAhUEoxW8="; 

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // 🚀 Edit States
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);

  // 🚀 Multiple Images State (Handles both existing URLs and new Files)
  const [productImages, setProductImages] = useState([]); // Format: { file: File|null, url: string, isExisting: boolean }

  // 🚀 Dynamic Category States
  const [categories, setCategories] = useState([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', category: '', condition: 'New', price: '', originalPrice: '', description: '',
  });

  // 🚀 Detect Edit Mode from Navigation State
  useEffect(() => {
    const editData = location.state?.editProduct;
    const editCollection = location.state?.collectionName;

    if (editData) {
      setEditingProductId(editData.id);
      setEditingCollection(editCollection);
      
      setFormData({
        name: editData.name || '',
        category: editData.category || '',
        condition: editData.condition || 'New',
        price: editData.price || '',
        originalPrice: editData.originalPrice || '',
        description: editData.description || '',
      });

      // Load existing images into preview
      let existingImages = [];
      if (editData.images && editData.images.length > 0) {
        existingImages = editData.images;
      } else if (editData.image) {
        existingImages = [editData.image];
      }
      
      setProductImages(existingImages.map(url => ({ file: null, url, isExisting: true })));
    }
  }, [location.state]);

  // Fetch Categories
  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, 'product_categories'));
    const cats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(cats);
    if (cats.length > 0 && !formData.category && !editingProductId) {
      setFormData(prev => ({ ...prev, category: cats[0].name }));
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Category Handlers
  const handleSaveCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      if (editingCatId) {
        await updateDoc(doc(db, 'product_categories', editingCatId), { name: newCatName });
      } else {
        await addDoc(collection(db, 'product_categories'), { name: newCatName });
      }
      setNewCatName(''); setEditingCatId(null); fetchCategories();
    } catch (err) { console.error(err); }
  };

  const handleDeleteCategory = async (id) => {
    if(window.confirm("Delete this category?")) {
      await deleteDoc(doc(db, 'product_categories', id));
      fetchCategories();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🚀 Handle New Images Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImgs = files.map(file => ({
        file: file,
        url: URL.createObjectURL(file),
        isExisting: false
      }));
      setProductImages(prev => [...prev, ...newImgs]);
    }
  };

  // 🚀 Remove Image (Works for both old and new)
  const removeImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  // 🚀 Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditingCollection(null);
    setFormData({ name: '', category: categories[0]?.name || '', condition: 'New', price: '', originalPrice: '', description: '' });
    setProductImages([]);
    // Clear the location state so it doesn't stay in edit mode on refresh
    navigate('/admin/products', { replace: true, state: {} });
  };

  // Upload Single New Image to ImageKit
  const uploadToImageKit = async (file) => {
    const form = new FormData();
    form.append("file", file); 
    form.append("fileName", file.name);
    const encodedKey = btoa(IMAGEKIT_PRIVATE_KEY + ":");
    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST", headers: { Authorization: `Basic ${encodedKey}` }, body: form,
    });
    const data = await response.json();
    if (response.ok) return data.url; 
    throw new Error(data.message || "Image upload failed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      if (productImages.length === 0) throw new Error("Please have at least one product image.");
      
      // 🚀 Bulk Handle Images (Upload new ones, keep old ones)
      const uploadPromises = productImages.map(async (img) => {
        if (img.isExisting) return img.url; // Already on server
        return await uploadToImageKit(img.file); // Needs uploading
      });
      const imageUrlsArray = await Promise.all(uploadPromises);

      const targetCollection = formData.condition === 'New' ? 'new_products' : 'refurbished_products';
      
      const productData = {
        name: formData.name, 
        category: formData.category, 
        condition: formData.condition,
        price: Number(formData.price), 
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        description: formData.description, 
        image: imageUrlsArray[0], // Main thumbnail
        images: imageUrlsArray,   // Array of all images
      };

      if (editingProductId) {
        // UPDATE MODE
        if (editingCollection && editingCollection !== targetCollection) {
          // Edge case: Admin changed condition (e.g. New -> Refurbished), move document
          await deleteDoc(doc(db, editingCollection, editingProductId));
          productData.createdAt = serverTimestamp();
          await addDoc(collection(db, targetCollection), productData);
        } else {
          // Normal Update
          productData.updatedAt = serverTimestamp();
          await updateDoc(doc(db, targetCollection, editingProductId), productData);
        }
        setSuccess(`${formData.name} updated successfully!`);
        setTimeout(() => handleCancelEdit(), 2000); // Redirect/reset after 2s
      } else {
        // ADD MODE
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, targetCollection), productData);
        setSuccess(`${formData.name} added successfully!`);
        setFormData({ name: '', category: categories[0]?.name || '', condition: 'New', price: '', originalPrice: '', description: '' });
        setProductImages([]);
      }
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto pb-10 relative">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              {editingProductId ? <span className="text-blue-400">Update Product</span> : 'Add New Product'}
            </h1>
            <p className="text-slate-400 mt-1">
              {editingProductId ? 'Editing existing product details.' : 'Upload parts, accessories, or refurbished devices.'}
            </p>
          </div>
          {editingProductId && (
            <button onClick={handleCancelEdit} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-700">
              <ArrowLeft className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6"><AlertCircle className="w-5 h-5"/>{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3 mb-6"><CheckCircle className="w-5 h-5"/>{success}</div>}

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 🚀 Multiple Image Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Product Images (Upload multiple)</label>
              
              <div className="relative border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors flex flex-col items-center justify-center min-h-[150px] overflow-hidden mb-4">
                <div className="text-center p-6 pointer-events-none">
                  <div className="bg-slate-700/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><ImageIcon className="text-slate-400" /></div>
                  <p className="text-sm text-slate-300">Click to upload images</p>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>

              {/* Image Previews Grid */}
              {productImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {productImages.map((imgObj, index) => (
                    <div key={index} className="relative aspect-square bg-slate-800 rounded-lg border border-slate-700 p-1 group">
                      <img src={imgObj.url} alt="Preview" className="w-full h-full object-contain rounded" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)} 
                        className="absolute -top-2 -right-2 bg-rose-500 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && <span className="absolute bottom-0 left-0 right-0 bg-purple-600/90 text-white text-[10px] font-bold text-center py-0.5 rounded-b">Cover</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Product Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Premium Display for iPhone 12" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none">
                <option value="New">New (Accessories & Parts)</option>
                <option value="Refurbished">Refurbished (Phones & Gadgets)</option>
              </select>
            </div>

            <div>
              <label className="flex justify-between items-center text-sm font-semibold text-slate-300 mb-2">
                Category
                <button type="button" onClick={() => setShowCatModal(true)} className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-xs"><Settings size={14}/> Manage</button>
              </label>
              <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none">
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Selling Price (₹)</label>
              <input type="number" name="price" required min="0" value={formData.price} onChange={handleInputChange} placeholder="2999" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Original MRP (Optional, ₹)</label>
              <input type="number" name="originalPrice" min="0" value={formData.originalPrice} onChange={handleInputChange} placeholder="4500 (For showing discount)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Product Description</label>
              <textarea name="description" required rows="4" value={formData.description} onChange={handleInputChange} placeholder="Features, warranty details, material etc..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
            <button type="submit" disabled={loading} className={`flex items-center gap-2 ${editingProductId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'} text-white px-8 py-3 rounded-xl font-bold transition-colors ${loading && 'opacity-70'}`}>
              {loading ? <Loader2 className="animate-spin" /> : (editingProductId ? <Edit className="w-5 h-5"/> : <UploadCloud className="w-5 h-5"/>)} 
              {editingProductId ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </form>

        {/* CATEGORY MANAGER MODAL */}
        {showCatModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Manage Categories</h3>
                <button onClick={() => setShowCatModal(false)}><X className="text-slate-400 hover:text-white"/></button>
              </div>
              
              <div className="flex gap-2 mb-6">
                <input type="text" value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="Category Name" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none" />
                <button onClick={handleSaveCategory} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
                  {editingCatId ? <Edit size={16}/> : <Plus size={16}/>} {editingCatId ? 'Update' : 'Add'}
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-white font-medium">{cat.name}</span>
                    <div className="flex gap-3">
                      <button onClick={() => { setEditingCatId(cat.id); setNewCatName(cat.name); }} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded"><Edit size={16}/></button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-rose-400 hover:text-rose-300 bg-rose-500/10 p-1.5 rounded"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && <p className="text-slate-500 text-center py-4">No categories found.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}