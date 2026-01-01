import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Store,
  Search,
  Filter,
  Download,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  MapPin,
  Star,
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import AdminLayout from '../../components/admin/AdminLayout';

interface StoreData {
  _id: string;
  accountId: string;
  storeName: string;
  ownerName: string;
  category: string;
  status: 'active' | 'inactive' | 'suspended';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rating: number;
  totalReviews: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  city: string;
  phone: string;
  createdAt: string;
}

export default function AdminStores() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');

  // Mock Data
  const mockStores: StoreData[] = [
    {
      _id: '1',
      accountId: 'acc001',
      storeName: 'متجر الإلكترونيات الحديثة',
      ownerName: 'محمد أحمد',
      category: 'إلكترونيات',
      status: 'active',
      verificationStatus: 'approved',
      rating: 4.8,
      totalReviews: 245,
      totalProducts: 156,
      totalOrders: 1240,
      revenue: 125000,
      city: 'دمشق',
      phone: '+963 11 123 4567',
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      _id: '2',
      accountId: 'acc002',
      storeName: 'متجر الأزياء العصرية',
      ownerName: 'سارة علي',
      category: 'ملابس',
      status: 'active',
      verificationStatus: 'approved',
      rating: 4.6,
      totalReviews: 189,
      totalProducts: 324,
      totalOrders: 980,
      revenue: 98000,
      city: 'حلب',
      phone: '+963 21 234 5678',
      createdAt: '2025-02-10T14:20:00Z'
    },
    {
      _id: '3',
      accountId: 'acc003',
      storeName: 'متجر المواد الغذائية',
      ownerName: 'خالد محمود',
      category: 'مواد غذائية',
      status: 'suspended',
      verificationStatus: 'approved',
      rating: 3.9,
      totalReviews: 67,
      totalProducts: 89,
      totalOrders: 340,
      revenue: 45000,
      city: 'حمص',
      phone: '+963 31 345 6789',
      createdAt: '2025-03-05T09:15:00Z'
    },
    {
      _id: '4',
      accountId: 'acc004',
      storeName: 'متجر الأثاث المنزلي',
      ownerName: 'فاطمة حسن',
      category: 'أثاث',
      status: 'active',
      verificationStatus: 'approved',
      rating: 4.9,
      totalReviews: 412,
      totalProducts: 78,
      totalOrders: 567,
      revenue: 210000,
      city: 'دمشق',
      phone: '+963 11 456 7890',
      createdAt: '2024-12-20T11:45:00Z'
    },
    {
      _id: '5',
      accountId: 'acc005',
      storeName: 'متجر الكتب والقرطاسية',
      ownerName: 'عمر يوسف',
      category: 'كتب',
      status: 'inactive',
      verificationStatus: 'pending',
      rating: 4.2,
      totalReviews: 123,
      totalProducts: 234,
      totalOrders: 456,
      revenue: 67000,
      city: 'اللاذقية',
      phone: '+963 41 567 8901',
      createdAt: '2025-04-12T08:30:00Z'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      inactive: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300',
      suspended: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    };

    const labels = {
      active: 'نشط',
      inactive: 'غير نشط',
      suspended: 'معلق'
    };

    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      inactive: <AlertCircle className="w-4 h-4" />,
      suspended: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getVerificationBadge = (status: string) => {
    const styles = {
      approved: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    };

    const labels = {
      approved: 'موثق',
      pending: 'قيد التوثيق',
      rejected: 'مرفوض'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredStores = mockStores.filter(store => {
    const matchesSearch = store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || store.status === filterStatus;
    const matchesVerification = filterVerification === 'all' || store.verificationStatus === filterVerification;
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const stats = {
    total: mockStores.length,
    active: mockStores.filter(s => s.status === 'active').length,
    suspended: mockStores.filter(s => s.status === 'suspended').length,
    totalRevenue: mockStores.reduce((sum, s) => sum + s.revenue, 0)
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  إدارة المتاجر
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredStores.length} متجر
                </p>
              </div>
            </div>

            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
              <Download className="w-4 h-4 ml-2" />
              تصدير البيانات
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">إجمالي المتاجر</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">متاجر نشطة</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Ban className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">متاجر معلقة</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.suspended}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإيرادات</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalRevenue.toLocaleString()} ل.س
              </p>
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
                  placeholder="البحث بالاسم أو الفئة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="suspended">معلق</option>
                </select>
              </div>

              {/* Verification Filter */}
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterVerification}
                  onChange={(e) => setFilterVerification(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">جميع حالات التوثيق</option>
                  <option value="approved">موثق</option>
                  <option value="pending">قيد التوثيق</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stores Table */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      المتجر
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      الفئة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      التقييم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      المنتجات
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      الطلبات
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      الإيرادات
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
                  {filteredStores.map((store) => (
                    <motion.tr
                      key={store._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {store.storeName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {store.storeName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {store.ownerName}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {getVerificationBadge(store.verificationStatus)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {store.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-gray-900 dark:text-white">
                            {store.rating}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({store.totalReviews})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {store.totalProducts}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {store.totalOrders.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {store.revenue.toLocaleString()} ل.س
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(store.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Eye className="w-4 h-4" />
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
