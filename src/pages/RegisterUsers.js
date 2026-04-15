import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import userService from '../services/userService';
import doctorService from '../services/doctorService';

function getDoctorLabel(doc) {
  const name = `${doc.firstName} ${doc.lastName}`;
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
          <span className="text-[#94a3b8]">Select Providers</span>
        )}
        {selectedDocs.map((doc) => (
          <span
            key={doc._id}
            className="inline-flex items-center gap-1 bg-[#e6f1ff] text-[#0089ff] text-xs font-medium px-2 py-1 rounded-md"
          >
            {doc.firstName} {doc.lastName}
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
              placeholder="Search providers..."
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0089ff]"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-[180px]">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#94a3b8]">No providers found</div>
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
                        {doc.firstName} {doc.lastName}
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

// Password validation: 12+ chars with upper, lower, number, and special
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$/;
function validatePassword(pwd) {
  if (!pwd) return 'Password is required';
  if (pwd.length < 12) return 'Password must be at least 12 characters';
  if (!PASSWORD_REGEX.test(pwd)) return 'Password must include uppercase, lowercase, number, and special character (@$!%*?&#)';
  return null;
}

// Accept MM/DD/YYYY or ISO; return ISO for backend. Return null if empty or invalid.
function parseDob(dob) {
  if (!dob || !dob.trim()) return null;
  const trimmed = dob.trim();
  // MM/DD/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, mm, dd, yyyy] = slashMatch;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  // Fallback to native parse (ISO, etc.)
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d.toISOString();
  return 'invalid';
}

function formatDobForDisplay(isoOrDate) {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default function RegisterUsers() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);

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
    isActive: true,
  });
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    doctorService.getDoctors().then((res) => {
      const list = res.data?.data?.data || res.data?.data?.doctors || res.data?.data || [];
      setDoctors(Array.isArray(list) ? list : []);
    }).catch(() => {});
  }, []);

  // Load existing user in edit mode
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        const res = await userService.getUserById(editId);
        const u = res.data?.data || res.data;
        if (!active || !u) return;
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          password: '',
          dob: formatDobForDisplay(u.dateOfBirth),
          gender: u.gender || '',
          address: u.address?.street || '',
          city: u.address?.city || '',
          state: u.address?.state || '',
          zipCode: u.address?.zipCode || '',
          phone: u.phone || '',
          licenseNumber: u.licenseNumber || '',
          isActive: u.isActive !== false,
        });
        setSelectedDoctors(Array.isArray(u.assignedDoctors) ? u.assignedDoctors.map(String) : []);
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load user');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [editId, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    // Required fields
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('First name, last name, and email are required');
      return;
    }

    // Password: required on create, optional on edit (if provided must meet policy)
    if (!isEdit) {
      const pwdErr = validatePassword(form.password);
      if (pwdErr) { setError(pwdErr); return; }
    } else if (form.password) {
      const pwdErr = validatePassword(form.password);
      if (pwdErr) { setError(pwdErr); return; }
    }

    // DOB
    const dobIso = parseDob(form.dob);
    if (dobIso === 'invalid') {
      setError('Date of Birth must be in MM/DD/YYYY format');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const basePayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        licenseNumber: form.licenseNumber,
        gender: form.gender,
      };
      if (dobIso) basePayload.dob = dobIso;

      if (isEdit) {
        const payload = { ...basePayload, isActive: form.isActive };
        if (form.password) payload.password = form.password;
        payload.assignedDoctors = selectedDoctors;
        await userService.updateUser(editId, payload);
        setSuccess('User updated successfully!');
        setTimeout(() => navigate('/sales-reps'), 900);
      } else {
        const payload = {
          ...basePayload,
          password: form.password,
          role: 'sales_rep',
        };
        if (selectedDoctors.length > 0) payload.assignedDoctors = selectedDoctors;
        await userService.createUser(payload);
        setSuccess(`User created successfully! Share these credentials with them: Email — ${form.email.trim()} / Password — ${form.password}`);
        setForm({
          firstName: '', lastName: '', email: '', password: '',
          dob: '', gender: '', address: '', city: '', state: '',
          zipCode: '', phone: '', licenseNumber: '', isActive: true,
        });
        setSelectedDoctors([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
      </div>
    );
  }

  const requiredStar = <span className="text-[#f23e41]">*</span>;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Sales Representative' : 'Register Sales Representative'}
        subtitle={isEdit ? 'Update sales representative details.' : 'Add a new sales representative to the system.'}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">First Name {requiredStar}</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Last Name {requiredStar}</label>
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
            <label className="block text-xs font-medium text-[#64748b] mb-2">Email {requiredStar}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email"
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">
              Password {!isEdit && requiredStar}
              {isEdit && <span className="text-[#94a3b8] font-normal"> (leave blank to keep existing)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={isEdit ? 'New password (optional)' : 'Min 12 chars, A-a-1-!'}
              className="w-full h-[50px] px-4 border border-[#d6dce8] rounded-[8px] text-sm text-[#24315d] placeholder:text-[#24315d] focus:outline-none focus:ring-2 focus:ring-[#0089ff]/20 focus:border-[#0089ff]"
            />
            <p className="text-[11px] text-[#94a3b8] mt-1">
              12+ chars with uppercase, lowercase, number & special character (@$!%*?&#)
            </p>
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
                placeholder="MM/DD/YYYY"
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
          <label className="block text-xs font-medium text-[#64748b] mb-2">Assigned Providers</label>
          <PractitionerMultiSelect
            doctors={doctors}
            selectedIds={selectedDoctors}
            onChange={setSelectedDoctors}
          />
        </div>

        {isEdit && (
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="w-4 h-4 rounded border-[#d6dce8] text-[#0089ff] focus:ring-[#0089ff]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-[#24315d] select-none cursor-pointer">
              Active
            </label>
          </div>
        )}
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
