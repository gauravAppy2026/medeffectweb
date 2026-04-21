import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import doctorService from '../services/doctorService';

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

/* ─── Add/Edit Doctor Form ─── */
function DoctorForm({ onCancel, onSave, initialData }) {
  const firstAddr = initialData?.addresses?.[0];
  const [form, setForm] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    department: initialData?.department || '',
    phone: initialData?.phone || '',
    address: typeof firstAddr === 'string' ? firstAddr : firstAddr?.street || '',
    city: (typeof firstAddr === 'object' ? firstAddr?.city : initialData?.city) || '',
    state: (typeof firstAddr === 'object' ? firstAddr?.state : initialData?.state) || '',
    zipCode: (typeof firstAddr === 'object' ? firstAddr?.zipCode : initialData?.zipCode) || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.department.trim()) {
      setError('First name, last name, and practice name are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const addrObj = {
        street: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
      };
      const hasAddress = addrObj.street || addrObj.city || addrObj.state || addrObj.zipCode;
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        department: form.department.trim(),
        addresses: hasAddress ? [addrObj] : [],
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (initialData?._id) {
        await doctorService.updateDoctor(initialData._id, payload);
      } else {
        await doctorService.createDoctor(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={initialData?._id ? 'Edit Provider' : 'Add Provider'} subtitle="Fill the provider details" />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">First Name <span className="text-[#f23e41]">*</span></label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Last Name <span className="text-[#f23e41]">*</span></label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Practice Name <span className="text-[#f23e41]">*</span></label>
          <input
            type="text"
            value={form.department}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="Enter practice name"
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Mobile Number</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter mobile number"
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter address"
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter city"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">State</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Enter state"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
        </div>

        <div className="w-1/2">
          <label className="block text-xs font-medium text-[#64748b] mb-2">Zip Code</label>
          <input
            type="text"
            value={form.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="Enter zip code"
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
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
export default function Doctors() {
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDoctors();
      const data = res.data?.data?.data || [];
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Delete ${doctor.firstName} ${doctor.lastName}?`)) return;
    try {
      await doctorService.deleteDoctor(doctor._id);
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to delete provider');
    }
  };

  if (showForm || editDoctor) {
    return (
      <DoctorForm
        initialData={editDoctor}
        onCancel={() => { setShowForm(false); setEditDoctor(null); }}
        onSave={() => { setShowForm(false); setEditDoctor(null); fetchDoctors(); }}
      />
    );
  }

  return (
    <div>
      <PageHeader title="Providers" subtitle="List of providers">
        <PrimaryButton onClick={() => setShowForm(true)}>+ Add Provider</PrimaryButton>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm overflow-hidden">
          <div className="bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
            <div className="grid grid-cols-[1fr_0.8fr_2fr_1fr_0.5fr] px-5 py-4">
              {['PROVIDER NAME', 'PRACTICE NAME', 'ADDRESS', 'PHONE', 'ACTIONS'].map((col) => (
                <span key={col} className="text-xs font-semibold text-[#64748b] uppercase">
                  {col}
                </span>
              ))}
            </div>
          </div>
          <div className="divide-y divide-[#e2e8f0]">
            {doctors.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#64748b]">No providers found</div>
            ) : (
              doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="grid grid-cols-[1fr_0.8fr_2fr_1fr_0.5fr] px-5 py-4 items-start hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-xs font-medium text-[#0f172a]">
                    {doctor.firstName} {doctor.lastName}
                  </span>
                  <span className="text-xs font-medium text-[#0f172a]">{doctor.department || '—'}</span>
                  <div className="space-y-0">
                    {(doctor.addresses || []).map((addr, i) => {
                      const addrStr = typeof addr === 'string'
                        ? addr
                        : [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');
                      return (
                        <p key={i} className="text-xs font-medium text-[#0f172a] leading-[22px]">
                          {addrStr || 'N/A'}
                        </p>
                      );
                    })}
                  </div>
                  <span className="text-xs font-medium text-[#0f172a]">{doctor.phone || 'N/A'}</span>
                  <ActionsDropdown
                    onEdit={() => setEditDoctor(doctor)}
                    onDelete={() => handleDelete(doctor)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
