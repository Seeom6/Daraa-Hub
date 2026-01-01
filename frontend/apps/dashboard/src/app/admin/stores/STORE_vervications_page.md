import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import AdminLayout from '../../components/admin/AdminLayout';

interface VerificationRequest {
  id: string;
  storeName: string;
  ownerName: string;
  ownerId: string;
  submittedDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required';
}

export default function AdminStoreVerification() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const verificationRequests: VerificationRequest[] = [
    {
      id: '1',
      storeName: 'متجر الإلكترونيات الذكية',
      ownerName: 'أحمد محمد',
      ownerId: '101',
      submittedDate: '2024-12-25',
      status: 'pending'
    },
    {
      id: '2',
      storeName: 'متجر الأزياء العصرية',
      ownerName: 'سارة خالد',
      ownerId: '102',
      submittedDate: '2024-12-24',
      status: 'pending'
    },
    {
      id: '3',
      storeName: 'متجر الأثاث المنزلي',
      ownerName: 'محمد حسن',
      ownerId: '103',
      submittedDate: '2024-12-23',
      status: 'under_review'
    },
    {
      id: '4',
      storeName: 'متجر الهدايا والإكسسوارات',
      ownerName: 'فاطمة علي',
      ownerId: '104',
      submittedDate: '2024-12-22',
      status: 'under_review'
    },
    {
      id: '5',
      storeName: 'متجر الكتب والقرطاسية',
      ownerName: 'خالد سعيد',
      ownerId: '105',
      submittedDate: '2024-12-20',
      status: 'approved'
    },
    {
      id: '6',
      storeName: 'متجر الرياضة واللياقة',
      ownerName: 'نور الدين',
      ownerId: '106',
      submittedDate: '2024-12-19',
      status: 'approved'
    },
    {
      id: '7',
      storeName: 'متجر المستلزمات الطبية',
      ownerName: 'ليلى أحمد',
      ownerId: '107',
      submittedDate: '2024-12-18',
      status: 'rejected'
    },
    {
      id: '8',
      storeName: 'متجر الألعاب الإلكترونية',
      ownerName: 'عمر خالد',
      ownerId: '108',
      submittedDate: '2024-12-17',
      status: 'info_required'
    }
  ];

  const statusLabels = {
    pending: 'قيد الانتظار',
    under_review: 'قيد المراجعة',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    info_required: 'معلومات مطلوبة'
  };

  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    under_review: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    approved: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    info_required: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
  };

  const statusIcons = {
    pending: Clock,
    under_review: FileText,
    approved: CheckCircle,
    rejected: XCircle,
    info_required: AlertCircle
  };

  // Filter by status and search
  const filteredRequests = verificationRequests.filter(request => {
    const matchesTab = request.status === activeTab;
    const matchesSearch = 
      request.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Count by status
  const statusCounts = {
    pending: verificationRequests.filter(r => r.status === 'pending').length,
    under_review: verificationRequests.filter(r => r.status === 'under_review').length,
    approved: verificationRequests.filter(r => r.status === 'approved').length,
    rejected: verificationRequests.filter(r => r.status === 'rejected').length,
    info_required: verificationRequests.filter(r => r.status === 'info_required').length
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 px-4 py-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link to="/admin/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              لوحة التحكم
            </Link>
            <span>/</span>
            <Link to="/admin/stores" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              المتاجر
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">طلبات التحقق</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                طلبات التحقق من المتاجر
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                مراجعة والموافقة على طلبات التحقق
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6 mb-6"
          >
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالمتجر أو المالك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Tabs Header */}
            <div className="border-b border-gray-200 dark:border-slate-700">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-6 py-4 font-medium transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'pending'
                      ? 'border-yellow-600 text-yellow-600 dark:text-yellow-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  قيد الانتظار
                  {statusCounts.pending > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-bold">
                      {statusCounts.pending}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('under_review')}
                  className={`px-6 py-4 font-medium transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'under_review'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  قيد المراجعة
                  {statusCounts.under_review > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                      {statusCounts.under_review}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('approved')}
                  className={`px-6 py-4 font-medium transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'approved'
                      ? 'border-green-600 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  موافق عليها
                  {statusCounts.approved > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">
                      {statusCounts.approved}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`px-6 py-4 font-medium transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'rejected'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  مرفوضة
                  {statusCounts.rejected > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
                      {statusCounts.rejected}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('info_required')}
                  className={`px-6 py-4 font-medium transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'info_required'
                      ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  معلومات مطلوبة
                  {statusCounts.info_required > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
                      {statusCounts.info_required}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      اسم المتجر
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      المالك
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      تاريخ التقديم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-12 h-12 text-gray-400" />
                          <p className="text-gray-500 dark:text-gray-400">
                            لا توجد طلبات في هذا القسم
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => {
                      const StatusIcon = statusIcons[request.status];
                      return (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('.action-button')) return;
                            navigate(`/admin/stores/verification/${request.id}`);
                          }}
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {request.storeName}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/admin/users/${request.ownerId}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {request.ownerName}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(request.submittedDate).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-4 h-4" />
                              <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${statusColors[request.status]}`}>
                                {statusLabels[request.status]}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 action-button">
                              <button
                                onClick={() => navigate(`/admin/stores/verification/${request.id}`)}
                                className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                title="مراجعة"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
