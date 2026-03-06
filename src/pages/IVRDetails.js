import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import IconButton from '../components/IconButton';
import ivrService from '../services/ivrService';
import api from '../services/api';

const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-[#fff8db]', text: 'text-[#c25e16]' },
  approved: { label: 'Approved', bg: 'bg-[rgba(222,252,237,0.6)]', text: 'text-[#007a55]' },
  rejected: { label: 'Rejected', bg: 'bg-[rgba(254,226,226,0.6)]', text: 'text-[#f23e41]' },
};

/* ─── 3-dot Actions Dropdown ─── */
function ActionsDropdown({ onView }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
      >
        <span className="material-symbols-outlined text-[#64748b] text-[20px]">more_vert</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-[#e2e8f0] rounded-[8px] shadow-lg w-[110px] z-30 py-1">
          <button
            onClick={() => { setOpen(false); onView(); }}
            className="flex items-center gap-2.5 px-3 py-2 w-full hover:bg-gray-50 text-xs font-medium text-[#64748b]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#64748b]">visibility</span>
            View
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Approval Document Upload Section ─── */
function ApprovalDocumentSection({ selectedFile, onFileChange, onRemoveFile, onCancel, onConfirm, loading }) {
  const fileInputRef = useRef(null);

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
    e.target.value = '';
  };

  return (
    <div className="border border-dashed border-[#007a55] rounded-[10px] bg-[rgba(222,252,237,0.15)] p-4 mb-4">
      <p className="text-[14px] font-semibold text-[#007a55] mb-1">Attached Approval Document</p>
      <p className="text-[12px] text-[#64748b] mb-3">
        Please upload the approval letter or certificate (PDF) to finalize this request.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInput}
        className="hidden"
      />

      {!selectedFile ? (
        <button
          onClick={handleSelectClick}
          className="w-full h-[40px] border border-dashed border-[#007a55] rounded-[8px] bg-white flex items-center justify-center gap-2 hover:bg-[#f0fdf4] transition-colors mb-3"
        >
          <span className="material-symbols-outlined text-[#007a55] text-[18px]">attach_file</span>
          <span className="text-[13px] font-medium text-[#007a55]">Select PDF Document</span>
        </button>
      ) : (
        <div className="w-full h-[40px] border border-dashed border-[#007a55] rounded-[8px] bg-white flex items-center justify-between px-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#007a55] text-[18px]">description</span>
            <span className="text-[13px] font-medium text-[#0f172a] truncate max-w-[200px]">{selectedFile.name}</span>
            <span className="text-[11px] text-[#64748b]">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
          </div>
          <button onClick={onRemoveFile} className="text-[#64748b] hover:text-[#f23e41] transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="text-[13px] font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={!selectedFile || loading}
          className={`h-[32px] px-4 rounded-[6px] text-[13px] font-medium transition-colors ${
            selectedFile && !loading
              ? 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
              : 'bg-[#e2e8f0] text-[#97a3b6] cursor-not-allowed'
          }`}
        >
          {loading ? 'Uploading & Approving...' : 'Confirm & Approve'}
        </button>
      </div>
    </div>
  );
}

/* ─── IVR Details Modal ─── */
function IVRDetailsModal({ record, onClose, onAction }) {
  const [approvalStep, setApprovalStep] = useState('initial');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (record) {
      setApprovalStep(record.status === 'approved' ? 'confirmed' : 'initial');
      setSelectedFile(null);
    }
  }, [record]);

  if (!record) return null;

  const firstName = record.patient?.firstName || '';
  const lastName = record.patient?.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const name = `${firstName} ${lastName}`.trim();
  const status = statusConfig[record.status] || statusConfig.pending;
  const isApprovedWithDoc = approvalStep === 'confirmed' || record.status === 'approved';

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await ivrService.updateIVR(record._id, { status: 'rejected' });
      onAction();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveConfirm = async () => {
    setActionLoading(true);
    try {
      let approvalDocument;
      // Upload the file first if one is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        approvalDocument = uploadRes.data?.data?.url || uploadRes.data?.url;
      }
      const payload = { status: 'approved' };
      if (approvalDocument) payload.approvalDocument = approvalDocument;
      await ivrService.updateIVR(record._id, payload);
      setApprovalStep('confirmed');
      onAction();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const dob = record.patient?.dateOfBirth
    ? new Date(record.patient.dateOfBirth).toLocaleDateString('en-GB')
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-white rounded-[14px] shadow-xl w-[500px] z-10 max-h-[90vh] overflow-y-auto">
        <div className="bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px] px-5 py-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#0f172a]">IVR Details</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[#64748b] hover:text-[#0f172a]"
          >
            <span className="material-symbols-outlined text-[24px]">cancel</span>
          </button>
        </div>

        <div className="p-5">
          <div className="bg-[#f9fafc] rounded-[13px] p-4 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-[34px] h-[34px] rounded-full bg-[#e6f1ff] flex items-center justify-center text-[13px] font-semibold text-[#0f172a]">
                {initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-[#0f172a]">{name}</p>
                  <span className={`inline-flex items-center px-2 py-0 rounded-[14px] text-[10px] font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#64748b]">{record.requestId}</p>
              </div>
            </div>

            {isApprovedWithDoc && (
              <div className="flex items-center justify-between border-t border-[#e8ebf1] pt-3">
                <p className="text-[12px] font-medium text-[#64748b]">
                  Decision made on {record.updatedAt ? new Date(record.updatedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium bg-[rgba(222,252,237,0.6)] text-[#007a55] border border-[#007a55]">
                  Approval Document Attached
                </span>
              </div>
            )}

            {record.status === 'pending' && approvalStep === 'initial' && (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 h-[32px] px-3 border border-[#f23e41] rounded-[6px] bg-white hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[#f23e41] text-[14px]">close</span>
                  <span className="text-[12px] font-medium text-[#f23e41]">Reject</span>
                </button>
                <button
                  onClick={() => setApprovalStep('uploading')}
                  className="flex items-center gap-1.5 h-[32px] px-4 bg-[#007a55] rounded-[6px] shadow-sm hover:bg-[#006647] transition-colors"
                >
                  <span className="material-symbols-outlined text-white text-[14px]">check</span>
                  <span className="text-[12px] font-medium text-white">Approve</span>
                </button>
              </div>
            )}
          </div>

          {approvalStep === 'uploading' && (
            <ApprovalDocumentSection
              selectedFile={selectedFile}
              onFileChange={(file) => setSelectedFile(file)}
              onRemoveFile={() => setSelectedFile(null)}
              onCancel={() => { setApprovalStep('initial'); setSelectedFile(null); }}
              onConfirm={handleApproveConfirm}
              loading={actionLoading}
            />
          )}

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-[12px] font-medium text-[#64748b] mb-1">Date of Birth</p>
              <p className="text-[14px] font-medium text-[#0f172a]">{dob}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#64748b] mb-1">Gender</p>
              <p className="text-[14px] font-medium text-[#0f172a] capitalize">{record.patient?.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#64748b] mb-1">Mobile Number</p>
              <p className="text-[14px] font-medium text-[#0f172a]">{record.patient?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="h-px bg-[#d6dce8] mb-5" />

          <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wider mb-3">
            Insurance Details
          </p>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-[12px] font-medium text-[#64748b] mb-1">Insurance Name</p>
              <p className="text-[14px] font-medium text-[#0f172a]">{record.insurance?.insuranceName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#64748b] mb-1">Policy Number</p>
              <p className="text-[14px] font-medium text-[#0f172a]">{record.insurance?.policyNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#64748b] mb-1">Subscriber Name</p>
              <p className="text-[14px] font-medium text-[#0f172a]">{record.insurance?.subscriberName || 'N/A'}</p>
            </div>
          </div>

          <p className="text-[12px] font-medium text-[#64748b] mb-2">Comments</p>
          <div className="w-full min-h-[100px] border border-[#d6dce8] rounded-[8px] px-4 py-3 text-[14px] text-[#24315d] mb-5">
            {record.comment || 'No comments'}
          </div>

          {record.documents && record.documents.length > 0 && (
            <>
              <p className="text-[12px] font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                Attached Documents
              </p>
              <div className="flex items-end gap-2">
                {record.documents.map((doc, i) => (
                  <div key={i} className="w-[41px] h-[50px] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#f23e41] text-[40px]">picture_as_pdf</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function IVRDetails() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [ivrData, setIvrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'All') params.status = activeTab.toLowerCase();
      if (search) params.search = search;

      const [ivrRes, countsRes] = await Promise.all([
        ivrService.getIVRRequests(params),
        ivrService.getStatusCounts().catch(() => ({ data: { data: {} } })),
      ]);

      const data = ivrRes.data?.data?.data || [];
      setIvrData(Array.isArray(data) ? data : []);
      setStatusCounts(countsRes.data?.data || {});
    } catch (err) {
      console.error('Failed to fetch IVR data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingCount = statusCounts.pending || 0;

  return (
    <div>
      <PageHeader
        title="IVR Details"
        subtitle="Review, verify and approve order requests from IVR details."
      >
        <SearchBar
          placeholder="Search IVR details..."
          className="w-[243px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton icon="filter_list" />
        <IconButton icon="upload" />
      </PageHeader>

      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 h-10 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === tab
                ? 'bg-[#0f172a] text-white'
                : 'bg-[#f7f8fb] text-[#64748b] hover:bg-[#e2e8f0]'
            }`}
          >
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span className="w-4 h-4 bg-[#de524c] text-white text-[12px] font-medium rounded flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-sm overflow-hidden">
          <div className="bg-[rgba(226,232,240,0.2)] border-b border-[#e2e8f0] rounded-t-[14px]">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_0.8fr_0.5fr] px-5 py-4">
              {['NAME', 'ADDRESS', 'MOBILE NUMBER', 'INSURANCE NAME', 'POLICY NUMBER', 'STATUS', 'ACTIONS'].map((col) => (
                <span key={col} className="text-xs font-semibold text-[#64748b] uppercase">
                  {col}
                </span>
              ))}
            </div>
          </div>
          <div className="divide-y divide-[#e2e8f0]">
            {ivrData.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#64748b]">No IVR requests found</div>
            ) : (
              ivrData.map((record) => {
                const sts = statusConfig[record.status] || statusConfig.pending;
                const name = `${record.patient?.firstName || ''} ${record.patient?.lastName || ''}`.trim();
                return (
                  <div
                    key={record._id}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_0.8fr_0.5fr] px-5 py-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="text-xs font-medium text-[#0f172a]">{name}</span>
                    <span className="text-xs font-medium text-[#0f172a]">{record.patient?.address || 'N/A'}</span>
                    <span className="text-xs font-medium text-[#0f172a]">{record.patient?.phone || 'N/A'}</span>
                    <span className="text-xs font-medium text-[#0f172a]">{record.insurance?.insuranceName || 'N/A'}</span>
                    <span className="text-xs font-medium text-[#0f172a]">{record.insurance?.policyNumber || 'N/A'}</span>
                    <span
                      className={`inline-flex items-center justify-center w-fit px-2.5 py-0.5 rounded-[6px] text-xs font-medium ${sts.bg} ${sts.text}`}
                    >
                      {sts.label}
                    </span>
                    <ActionsDropdown onView={() => setSelectedRecord(record)} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <IVRDetailsModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onAction={fetchData}
      />
    </div>
  );
}
