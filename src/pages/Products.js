import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SearchBar from '../components/SearchBar';
import productService from '../services/productService';

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
    if (!form.name) {
      setError('Product name is required');
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
                  <button
                    onClick={() => setEditProduct(p)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                  >
                    <span className="material-symbols-outlined text-[#64748b] text-[20px]">more_vert</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
