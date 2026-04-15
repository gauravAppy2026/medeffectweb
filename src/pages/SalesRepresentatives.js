import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import IconButton from '../components/IconButton';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';

function SalesRepCard({ rep, onEdit }) {
  const firstName = rep.firstName || '';
  const lastName = rep.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const name = `${firstName} ${lastName}`.trim();

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-[34px] h-[34px] rounded-full bg-[#e6f1ff] flex items-center justify-center text-[13px] font-semibold text-[#0f172a]">
              {initials}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0f172a]">{name}</p>
              <p className="text-xs font-medium text-[#64748b]">{rep.licenseNumber || rep.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={rep.isActive !== false ? 'active' : 'inactive'} size="small" />
            <button
              onClick={() => onEdit && onEdit(rep)}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <span className="material-symbols-outlined text-[#64748b] text-[18px]">edit</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-[#64748b] text-[18px]">location_on</span>
          <span className="text-xs font-medium text-[#64748b]">
            {rep.address?.city && rep.address?.state
              ? `${rep.address.city}, ${rep.address.state}`
              : rep.address?.street
                ? [rep.address.street, rep.address.city, rep.address.state].filter(Boolean).join(', ')
                : 'N/A'}
          </span>
        </div>

        <div className="h-px bg-[#e2e8f0] mb-4" />

        <div className="flex gap-6">
          <div>
            <p className="text-[10px] font-medium text-[#64748b]">Orders</p>
            <p className="text-base font-semibold text-[#0f172a]">{rep.orderCount || 0}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-[#64748b]">IVR Request</p>
            <p className="text-base font-semibold text-[#0f172a]">{rep.ivrCount || 0}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-[#64748b]">Practitioners</p>
            <p className="text-base font-semibold text-[#0f172a]">{rep.practitionerCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-2.5 bg-[rgba(226,232,240,0.2)] border-t border-[#e2e8f0] flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[#64748b] text-[16px]">calendar_today</span>
        <span className="text-[10px] font-medium text-[#64748b]">
          Joined: {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
        </span>
      </div>
    </div>
  );
}

export default function SalesRepresentatives() {
  const navigate = useNavigate();
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchReps() {
      setLoading(true);
      try {
        const params = { role: 'sales_rep' };
        if (search) params.search = search;
        const res = await userService.getUsers(params);
        const data = res.data?.data?.data || [];
        setReps(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch sales reps:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReps();
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Sales Representatives"
        subtitle="Manage registered sales representatives and their performance."
      >
        <SearchBar
          placeholder="Search by name, license..."
          className="w-[243px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton icon="upload" />
        <PrimaryButton onClick={() => navigate('/registrations')}>+ Add User</PrimaryButton>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
        </div>
      ) : reps.length === 0 ? (
        <div className="text-center py-12 text-sm text-[#64748b]">No sales representatives found</div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {reps.map((rep) => (
            <SalesRepCard
              key={rep._id}
              rep={rep}
              onEdit={(r) => navigate(`/registrations/${r._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
