import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import cmsService from '../services/cmsService';

const PAGE_LABELS = {
  help_support: 'Help & Support',
  terms_of_service: 'Terms of Service',
  privacy_policy: 'Privacy Policy',
};

function CmsEditor({ page, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: page?.title || '',
    content: page?.content || '',
    contactPhone: page?.contactPhone || '',
    contactEmail: page?.contactEmail || '',
    url: page?.url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const isHelpSupport = page?.key === 'help_support';

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await cmsService.update(page.key, form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Edit: ${PAGE_LABELS[page.key] || page.title}`}
        subtitle="Update content shown in the mobile app"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-5 max-w-[700px]">
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] resize-y"
            placeholder="Enter content text..."
          />
        </div>

        {isHelpSupport && (
          <>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-2">Phone Number</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="e.g. +1 (800) 123-4567"
                className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-2">Email Address</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="e.g. support@medeffects.com"
                className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
              />
            </div>
          </>
        )}

        {!isHelpSupport && (
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">URL (opens in device browser)</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com/terms"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-8 max-w-[700px]">
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

export default function ContentManagement() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPage, setEditPage] = useState(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsService.getAll();
      const data = res.data?.data || [];
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch CMS pages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  if (editPage) {
    return (
      <CmsEditor
        page={editPage}
        onCancel={() => setEditPage(null)}
        onSave={() => { setEditPage(null); fetchPages(); }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Content Management"
        subtitle="Manage app content pages (Help, Terms, Privacy)"
      />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pages.map((page) => (
            <div
              key={page.key}
              className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm p-5"
            >
              <div className="w-[40px] h-[40px] bg-[#eaf4ff] rounded-[10px] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#0089ff] text-[24px]">
                  {page.key === 'help_support' ? 'support_agent' : page.key === 'terms_of_service' ? 'gavel' : 'shield'}
                </span>
              </div>

              <p className="text-[14px] font-semibold text-[#0f172a] mb-1">
                {PAGE_LABELS[page.key] || page.title}
              </p>
              <p className="text-[12px] text-[#64748b] mb-4 line-clamp-2">
                {page.content ? page.content.substring(0, 100) + (page.content.length > 100 ? '...' : '') : 'No content yet'}
              </p>

              {page.key === 'help_support' && (page.contactPhone || page.contactEmail) && (
                <div className="mb-3 text-[11px] text-[#64748b] space-y-0.5">
                  {page.contactPhone && <p>Phone: {page.contactPhone}</p>}
                  {page.contactEmail && <p>Email: {page.contactEmail}</p>}
                </div>
              )}

              {page.url && (
                <div className="mb-3 text-[11px] text-[#0089ff] truncate">
                  {page.url}
                </div>
              )}

              <button
                onClick={() => setEditPage(page)}
                className="flex items-center gap-1.5 h-[30px] px-3 border border-[#0089ff] rounded-[6px] bg-white hover:bg-[#f0f7ff] transition-colors"
              >
                <span className="material-symbols-outlined text-[#0089ff] text-[16px]">edit</span>
                <span className="text-[12px] font-medium text-[#0089ff]">Edit</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
