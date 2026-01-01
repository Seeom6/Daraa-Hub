import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Store,
  Truck,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import AdminLayout from '../../components/admin/AdminLayout';

interface VerificationRequest {
  _id: string;
  accountId: string;
  applicantName: string;
  applicantType: 'store_owner' | 'courier';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required';
  documentsCount: number;
  submittedAt: string;
  businessName?: string;
  vehicleType?: string;
}

export default function AdminVerifications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);

  // Mock Data
  const mockRequests: VerificationRequest[] = [
    {
      _id: '1',
      accountId: 'acc001',
      applicantName: 'محمد أحمد',
      applicantType: 'store_owner',
      status: 'pending',
      documentsCount: 5,
      submittedAt: '2025-12-20T10:30:00Z',
      businessName: 'متجر الإلكترونيات الحديثة'
    },
    {
      _id: '2',
      accountId: 'acc002',
      applicantName: 'سارة علي',
      applicantType: 'courier',
      status: 'under_review',
      documentsCount: 4,
      submittedAt: '2025-12-19T14:20:00Z',
      vehicleType: 'دراجة نارية'
    },
    {
      _id: '3',
      accountId: 'acc003',
      applicantName: 'خالد محمود',
      applicantType: 'store_owner',
      status: 'info_required',
      documentsCount: 3,
      submittedAt: '2025-12-18T09:15:00Z',
      businessName: 'متجر الأزياء العصرية'
    },
    {
      _id: '4',
      accountId: 'acc004',
      applicantName: 'فاطمة حسن',
      applicantType: 'courier',
      status: 'approved',
      documentsCount: 5,
      submittedAt: '2025-12-17T11:45:00Z',
      vehicleType: 'سيارة'
    },
    {
      _id: '5',
      accountId: 'acc005',
      applicantName: 'عمر يوسف',
      applicantType: 'store_owner',
      status: 'rejected',
      documentsCount: 2,
      submittedAt: '2025-12-16T08:30:00Z',
      businessName: 'متجر المواد الغذائية'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under_review':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info_required':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      under_review: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      info_required: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
    };

    const labels = {
      pending: 'قيد الانتظار',
      under_review: 'قيد المراجعة',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      info_required: 'معلومات مطلوبة'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {getStatusIcon(status)}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = request.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.vehicleType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.applicantType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    pending: mockRequests.filter(r => r.status === 'pending').length,
    under_review: mockRequests.filter(r => r.status === 'under_review').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    rejected: mockRequests.filter(r => r.status === 'rejected').length,
    info_required: mockRequests.filter(r => r.status === 'info_required').length
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  طلبات التحقق
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredRequests.length} طلب تحقق
                </p>
              </div>
            </div>

            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Download className="w-4 h-4 ml-2" />
              تصدير البيانات
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">قيد الانتظار</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">قيد المراجعة</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.under_review}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">معلومات مطلوبة</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.info_required}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">موافق عليه</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">مرفوض</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث بالاسم أو النشاط..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 dark:focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 dark:focus:border-purple-500 text-gray-900 dark:text-white focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="under_review">قيد المراجعة</option>
                  <option value="info_required">معلومات مطلوبة</option>
                  <option value="approved">موافق عليه</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 dark:focus:border-purple-500 text-gray-900 dark:text-white focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="store_owner">أصحاب المتاجر</option>
                  <option value="courier">السائقين</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      المتقدم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      التفاصيل
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      المستندات
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      تاريخ التقديم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredRequests.map((request) => (
                    <motion.tr
                      key={request._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {request.applicantName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {request.applicantName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {request.accountId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {request.applicantType === 'store_owner' ? (
                            <>
                              <Store className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-900 dark:text-white">صاحب متجر</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-900 dark:text-white">سائق</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {request.businessName || request.vehicleType || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {request.documentsCount} مستند
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.submittedAt).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            عرض
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
