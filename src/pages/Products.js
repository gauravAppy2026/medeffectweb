import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SearchBar from '../components/SearchBar';
import productService from '../services/productService';

/* ─── 3-dot Actions Dropdown with Edit/Delete ─── */
function ActionsDropdown({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 120);
    }
    setOpen(!open);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
      >
        <span className="material-symbols-outlined text-[#64748b] text-[20px]">more_vert</span>
      </button>

      {open && (
        <div className={`absolute right-0 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'} bg-white border border-[#e2e8f0] rounded-[8px] shadow-lg w-[110px] z-30 py-1`}>
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="flex items-center gap-2.5 px-3 py-2 w-full hover:bg-gray-50 text-xs font-medium text-[#64748b]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#64748b]">edit</span>
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="flex items-center gap-2.5 px-3 py-2 w-full hover:bg-gray-50 text-xs font-medium text-[#64748b]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#64748b]">delete</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Add/Edit Product Form ─── */
function ProductForm({ onCancel, onSave, initialData }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    category: initialData?.category || '',
    price: initialData?.price || '',
    stock: initialData?.stock || 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.category) {
      setError('Product name, SKU, and category are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock) || 0,
      };
      if (initialData?._id) {
        await productService.updateProduct(initialData._id, payload);
      } else {
        await productService.createProduct(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={initialData?._id ? 'Edit Product' : 'Add Products'} subtitle="Manage your product catalog." />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="mb-6">
        <label className="block text-xs font-medium text-[#64748b] mb-2">Product Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter product name"
          className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">SKU</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="Enter SKU"
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="Enter category"
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-10">
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Price</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="Enter price"
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Stock Quantity</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="h-[50px] w-[110px] border border-[#e2e8f0] rounded-[10px] text-sm font-semibold text-[#97a3b6] hover:bg-gray-50 transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="h-[50px] w-[110px] bg-[#0089ff] text-white text-sm font-semibold rounded-[10px] hover:bg-[#0077e6] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Products() {
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await productService.getProducts(params);
      const data = res.data?.data?.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product) => {
    try {
      await productService.deleteProduct(product._id);
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  if (showForm || editProduct) {
    return (
      <ProductForm
        initialData={editProduct}
        onCancel={() => { setShowForm(false); setEditProduct(null); }}
        onSave={() => { setShowForm(false); setEditProduct(null); fetchProducts(); }}
      />
    );
  }

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your product catalog.">
        <SearchBar
          placeholder="Search products..."
          className="w-[243px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <PrimaryButton onClick={() => setShowForm(true)}>+ Add Product</PrimaryButton>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm overflow-hidden">
          <div className="bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
            <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.6fr_0.5fr] px-5 py-4">
              {['PRODUCT NAME', 'SKU', 'CATEGORY', 'PRICE', 'STOCK', 'ACTIONS'].map((col) => (
                <span key={col} className="text-xs font-semibold text-[#64748b] uppercase">{col}</span>
              ))}
            </div>
          </div>
          <div className="divide-y divide-[#e2e8f0]">
            {products.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#64748b]">No products found</div>
            ) : (
              products.map((p) => (
                <div key={p._id} className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.6fr_0.5fr] px-5 py-4 items-center hover:bg-gray-50/50">
                  <span className="text-xs font-medium text-[#0f172a]">{p.name}</span>
                  <span className="text-xs font-medium text-[#64748b]">{p.sku}</span>
                  <span className="text-xs font-medium text-[#0f172a]">{p.category}</span>
                  <span className="text-xs font-medium text-[#0f172a]">${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}</span>
                  <span className="text-xs font-medium text-[#0f172a]">{p.stock}</span>
                  <ActionsDropdown
                    onEdit={() => setEditProduct(p)}
                    onDelete={() => setDeleteConfirm(p)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
            <h3 className="text-base font-semibold text-[#24315d] mb-2">Delete Product</h3>
            <p className="text-sm text-[#64748b] mb-6">
              Are you sure you want to delete <span className="font-medium text-[#24315d]">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="h-[40px] px-5 border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#64748b] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="h-[40px] px-5 bg-[#f23e41] text-white text-sm font-medium rounded-lg hover:bg-[#d93336]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
