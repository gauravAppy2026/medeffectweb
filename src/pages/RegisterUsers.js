import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import userService from '../services/userService';
import doctorService from '../services/doctorService';

function getDoctorLabel(doc) {
  const name = `Dr. ${doc.firstName} ${doc.lastName}`;
  const addr = doc.addresses && doc.addresses.length > 0 ? doc.addresses[0] : null;
  if (addr) {
    const parts = [addr.street, addr.city].filter(Boolean);
    return parts.length > 0 ? `${name} — ${parts.join(', ')}` : name;
  }
  return name;
}

function PractitionerMultiSelect({ doctors, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = doctors.filter((doc) => {
    const label = getDoctorLabel(doc).toLowerCase();
    return label.includes(search.toLowerCase());
  });

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((d) => d !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedDocs = doctors.filter((d) => selectedIds.includes(d._id));

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="w-full min-h-[50px] px-4 py-2 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] cursor-pointer bg-white focus-within:ring-2 focus-within:ring-[#0089ff]/20 focus-within:border-[#0089ff] flex items-center flex-wrap gap-1.5"
      >
        {selectedDocs.length === 0 && (
          <span className="text-[#94a3b8]">Select Practitioners</span>
        )}
        {selectedDocs.map((doc) => (
          <span
            key={doc._id}
            className="inline-flex items-center gap-1 bg-[#e6f1ff] text-[#0089ff] text-xs font-medium px-2 py-1 rounded-md"
          >
            Dr. {doc.firstName} {doc.lastName}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(doc._id); }}
              className="text-[#0089ff] hover:text-red-500 text-sm leading-none"
            >
              &times;
            </button>
          </span>
        ))}
        <span className="material-symbols-outlined ml-auto text-[#64748b] text-[20px] flex-shrink-0">
          expand_more
        </span>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#d6dce8] rounded-[8px] shadow-lg max-h-[240px] overflow-hidden">
          <div className="p-2 border-b border-[#e2e8f0]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors..."
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0089ff]"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-[180px]">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#94a3b8]">No doctors found</div>
            ) : (
              filtered.map((doc) => {
                const isSelected = selectedIds.includes(doc._id);
                return (
                  <div
                    key={doc._id}
                    onClick={() => toggle(doc._id)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#f8fafc] ${isSelected ? 'bg-[#f0f7ff]' : ''}`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#0089ff] border-[#0089ff]' : 'border-[#d6dce8]'}`}>
                      {isSelected && <span className="text-white text-[10px] font-bold">&#10003;</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[#24315d] font-medium truncate">
                        Dr. {doc.firstName} {doc.lastName}
                      </p>
                      {doc.addresses && doc.addresses.length > 0 && (
                        <p className="text-xs text-[#64748b] truncate">
                          {[doc.addresses[0].street, doc.addresses[0].city, doc.addresses[0].state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterUsers() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    licenseNumber: '',
  });
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    doctorService.getDoctors().then((res) => {
      const list = res.data?.data?.data || res.data?.data?.doctors || res.data?.data || [];
      setDoctors(Array.isArray(list) ? list : []);
    }).catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      setError('First name, last name, and email are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password || 'TempPass123!',
        role: 'sales_rep',
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        licenseNumber: form.licenseNumber,
        dob: form.dob,
        gender: form.gender,
      };
      if (selectedDoctors.length > 0) {
        payload.assignedDoctors = selectedDoctors;
      }
      await userService.createUser(payload);
      setSuccess('User registered successfully!');
      setForm({
        firstName: '', lastName: '', email: '', password: '',
        dob: '', gender: '', address: '', city: '', state: '',
        zipCode: '', phone: '', licenseNumber: '',
      });
      setSelectedDoctors([]);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to register user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Register Sales Representative"
        subtitle="Add a new sales representative to the system."
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">{success}</div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Enter password"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Date of Birth</label>
            <div className="relative">
              <input
                type="text"
                value={form.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                placeholder="YYYY/MM/DD"
                className="w-full h-[50px] px-4 pr-10 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[24px] pointer-events-none">
                calendar_today
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Gender</label>
            <div className="relative">
              <select
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full h-[50px] px-4 pr-10 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff] bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
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

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Zip Code</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="Enter zip code"
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
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">License Number</label>
          <input
            type="text"
            value={form.licenseNumber}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
            placeholder="Enter license number"
            className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-2">Select Practitioner</label>
          <PractitionerMultiSelect
            doctors={doctors}
            selectedIds={selectedDoctors}
            onChange={setSelectedDoctors}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-10">
        <button
          onClick={() => navigate('/sales-reps')}
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
