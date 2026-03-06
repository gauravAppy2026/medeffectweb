export const sidebarItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/' },
  { label: 'Orders', icon: 'order_approve', path: '/orders' },
  { label: 'Sales Reps', icon: 'analytics', path: '/sales-reps' },
  { label: 'Shipments', icon: 'package_2', path: '/shipments' },
  { label: 'Reports', icon: 'finance_mode', path: '/reports' },
  { label: 'IVR Details', icon: 'call_quality', path: '/ivr-details' },
  { label: 'Products', icon: 'inventory_2', path: '/products' },
  { label: 'Doctors', icon: 'stethoscope', path: '/doctors' },
  { label: 'Content', icon: 'article', path: '/content' },
  { label: 'Audit Logs', icon: 'shield', path: '/audit-logs' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];

export const dashboardStats = [
  { label: "Today's Orders", value: '47', change: '+12%', icon: 'order_approve' },
  { label: 'Pending Verification', value: '23', change: '-3', icon: 'schedule' },
  { label: 'Shipped Today', value: '31', change: '+8%', icon: 'inventory_2' },
  { label: 'Active Sales Reps', value: '156', change: '+2', icon: 'analytics' },
  { label: 'Total Orders (MTD)', value: '1,247', change: '+18%', icon: 'finance_mode' },
  { label: 'Approval Rate', value: '94.2%', change: '+2.1%', icon: 'check_circle' },
];

export const recentOrders = [
  { id: 'ORD-20251218-0047', patient: 'Robert Martinez', product: 'Insulin Pen Kit', status: 'pending' },
  { id: 'ORD-20251218-0046', patient: 'Emily Chen', product: 'Blood Glucose Monitor', status: 'approved' },
  { id: 'ORD-20251218-0045', patient: 'James Wilson', product: 'Continous Glucose Monitor', status: 'shipped' },
  { id: 'ORD-20251218-0044', patient: 'Maria Garcia', product: 'Insulin Pump Supplies', status: 'pending' },
  { id: 'ORD-20251218-0043', patient: 'Thomas Brown', product: 'Insulin Pen Kit', status: 'delivered' },
];

export const pendingActions = [
  { title: '2 Critical Orders', subtitle: 'Require immediate attention', icon: 'error', bgColor: 'bg-red-50/80', btnColor: 'bg-red-500', btnText: 'Review' },
  { title: '2 Pending Registrations', subtitle: 'New sales rep applications', icon: 'person_add', bgColor: 'bg-yellow-50', btnColor: 'bg-orange-600', btnText: 'Review' },
  { title: '3 Licenses Expiring', subtitle: 'Within next 30 days', icon: 'calendar_today', bgColor: 'bg-blue-50', btnColor: 'bg-blue-600', btnText: 'View' },
];

export const recentIVR = [
  { name: 'John Doe', id: 'IVR-2025-0847', initials: 'SJ', status: 'approved' },
  { name: 'Marry Smith', id: 'IVR-2025-0846', initials: 'MS', status: 'pending' },
  { name: 'Robert Lee', id: 'IVR-2025-0845', initials: 'RL', status: 'rejected' },
];

export const ordersTableData = [
  { id: 'ORD-20251218-0047', product: 'Insulin Pen Kit', salesRep: 'Sarah Johnson', quantity: '1 unit', priority: 'urgent', status: 'pending', date: '2025/12/18 09:34' },
  { id: 'ORD-20251218-0046', product: 'Blood Glucose Monitor', salesRep: 'Michael Torres', quantity: '10 unit', priority: 'normal', status: 'approved', date: '2025/12/20 09:34' },
  { id: 'ORD-20251218-0045', product: 'Continous Glucose Monitor', salesRep: 'Sarah Johnson', quantity: '2 unit', priority: 'normal', status: 'shipped', date: '2025/12/06 04:22' },
  { id: 'ORD-20251218-0044', product: 'Insulin Pump Supplies', salesRep: 'David Kim', quantity: '5 unit', priority: 'critical', status: 'pending', date: '2025/12/05 05:40' },
  { id: 'ORD-20251218-0043', product: 'Diabetic Test Strips', salesRep: 'Lisa Anderson', quantity: '2 unit', priority: 'normal', status: 'delivered', date: '2025/12/22 08:20' },
  { id: 'ORD-20251218-0042', product: 'Insulin Pen Needles', salesRep: 'Michael Torres', quantity: '3 unit', priority: 'normal', status: 'approved', date: '2025/12/15 07:35' },
];

export const salesRepsData = [
  { name: 'Sarah Johnson', license: 'MED-45678-2025', location: 'Los Angeles, CA', initials: 'SJ', status: 'active', orders: 234, ivrRequests: 300, practitioners: 10, licenseExpiry: '2025-03-15' },
  { name: 'Michael Torres', license: 'MED-45679-2025', location: 'Houston, TX', initials: 'MT', status: 'active', orders: 189, ivrRequests: 200, practitioners: 10, licenseExpiry: '2025-05-22' },
  { name: 'David Kim', license: 'MED-45680-2025', location: 'Chicago, IL', initials: 'DK', status: 'active', orders: 156, ivrRequests: 200, practitioners: 10, licenseExpiry: '2025-01-10' },
  { name: 'Lisa Anderson', license: 'MED-45681-2025', location: 'Phoenix, AZ', initials: 'LA', status: 'active', orders: 201, ivrRequests: 250, practitioners: 10, licenseExpiry: '2025-02-28' },
  { name: 'James Peterson', license: 'MED-45682-2025', location: 'Miami, FL', initials: 'JP', status: 'pending', orders: 0, ivrRequests: 20, practitioners: 10, licenseExpiry: '2025-12-15' },
];

export const doctorsData = [
  { name: 'Dr. Patrick', department: 'Neurologist', addresses: ['123, Art Street, Creative Nagar, New Delhi – 110001', '246, XYZ Street, AK Nagar, Delhi – 241231', '972, ABC Street, WB Nagar, Delhi – 913812'], salesRep: 'John Doe' },
  { name: 'Dr. Patrick', department: 'Neurologist', addresses: ['123, Art Street, Creative Nagar, New Delhi – 110001', '246, XYZ Street, AK Nagar, Delhi – 241231', '972, ABC Street, WB Nagar, Delhi – 913812'], salesRep: 'Jonathan Silverman' },
];

export const currentUser = {
  name: 'vexel123',
  email: 'vexel123@yopmail.com',
  initials: 'V',
};
