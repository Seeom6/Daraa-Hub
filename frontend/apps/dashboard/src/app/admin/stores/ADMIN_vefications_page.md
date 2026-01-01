import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Building,
  Tag,
  X,
  MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'sonner@2.0.3';

export default function AdminVerificationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestedInfo, setRequestedInfo] = useState('');
  const [missingDocs, setMissingDocs] = useState({
    businessLicense: false,
    taxId: false,
    nationalId: false,
    other: false
  });

  // Mock data
  const verificationRequest = {
    id: id || '1',
    storeName: 'متجر الإلكترونيات الذكية',
    status: 'pending' as const,
    submittedDate: '2024-12-25',
    owner: {
      id: '101',
      name: 'أحمد محمد علي',
      phone: '+963 991 234 567',
      email: 'ahmed@example.com'
    },
    business: {
      address: 'دمشق، المزة، شارع المتنبي، بناء 15',
      phone: '+963 11 234 5678',
      categories: ['إلكترونيات', 'أجهزة محمولة', 'إكسسوارات'],
      description: 'متجر متخصص في بيع الأجهزة الإلكترونية والهواتف الذكية مع ضمان سنتين وخدمة ما بعد البيع'
    },
    documents: [
      {
        id: 1,
        name: 'رخصة العمل التجارية',
        type: 'business_license',
        url: '#',
        uploadedDate: '2024-12-25'
      },
      {
        id: 2,
        name: 'الرقم الضريبي',
        type: 'tax_id',
        url: '#',
        uploadedDate: '2024-12-25'
      },
      {
        id: 3,
        name: 'الهوية الشخصية',
        type: 'national_id',
        url: '#',
        uploadedDate: '2024-12-25'
      },
      {
        id: 4,
        name: 'عقد الإيجار',
        type: 'other',
        url: '#',
        uploadedDate: '2024-12-25'
      }
    ]
  };

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

  const handleApprove = () => {
    toast.success('تمت الموافقة على المتجر بنجاح');
    setShowApproveModal(false);
    setTimeout(() => navigate('/admin/stores/verification'), 1500);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('يرجى كتابة سبب الرفض');
      return;
    }
    toast.success('تم رفض الطلب بنجاح');
    setShowRejectModal(false);
    setTimeout(() => navigate('/admin/stores/verification'), 1500);
  };

  const handleRequestInfo = () => {
    if (!requestedInfo.trim() && !Object.values(missingDocs).some(v => v)) {
      toast.error('يرجى تحديد المعلومات المطلوبة');
      return;
    }
    toast.success('تم إرسال طلب المعلومات بنجاح');
    setShowRequestInfoModal(false);
    setTimeout(() => navigate('/admin/stores/verification'), 1500);
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
            <Link to="/admin/stores/verification" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              طلبات التحقق
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{verificationRequest.storeName}</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/stores/verification')}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  تفاصيل طلب التحقق
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  مراجعة طلب التحقق من المتجر
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {verificationRequest.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowApproveModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  الموافقة
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  variant="outline"
                  className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  رفض
                </Button>
                <Button
                  onClick={() => setShowRequestInfoModal(true)}
                  variant="outline"
                  className="border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400"
                >
                  <AlertCircle className="w-4 h-4 ml-2" />
                  طلب معلومات
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Request Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              معلومات الطلب
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">اسم المتجر</p>
                  <p className="font-bold text-gray-900 dark:text-white">{verificationRequest.storeName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ التقديم</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {new Date(verificationRequest.submittedDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColors[verificationRequest.status]}`}>
                  {verificationRequest.status === 'pending' && <Clock className="w-6 h-6" />}
                  {verificationRequest.status === 'approved' && <CheckCircle className="w-6 h-6" />}
                  {verificationRequest.status === 'rejected' && <XCircle className="w-6 h-6" />}
                  {verificationRequest.status === 'info_required' && <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الحالة</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {statusLabels[verificationRequest.status]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">المالك</p>
                  <Link
                    to={`/admin/users/${verificationRequest.owner.id}`}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {verificationRequest.owner.name}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Owner Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              معلومات المالك
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الاسم الكامل</p>
                  <p className="font-medium text-gray-900 dark:text-white">{verificationRequest.owner.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف</p>
                  <p className="font-medium text-gray-900 dark:text-white">{verificationRequest.owner.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-900 dark:text-white">{verificationRequest.owner.email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Business Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              معلومات العمل التجاري
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">العنوان التجاري</p>
                  <p className="font-medium text-gray-900 dark:text-white">{verificationRequest.business.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">هاتف العمل</p>
                  <p className="font-medium text-gray-900 dark:text-white">{verificationRequest.business.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">التصنيفات</p>
                  <div className="flex flex-wrap gap-2">
                    {verificationRequest.business.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">وصف النشاط التجاري</p>
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    {verificationRequest.business.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              المستندات المرفقة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verificationRequest.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          تم الرفع: {new Date(doc.uploadedDate).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Review Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              ملاحظات المراجعة
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ملاحظات المدير
                </label>
                <textarea
                  rows={6}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all resize-none"
                  placeholder="اكتب ملاحظاتك هنا..."
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                💡 هذه الملاحظات داخلية للاستخدام الإداري فقط
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                الموافقة على المتجر
              </h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✅ سيتم الموافقة على المتجر وتفعيل حسابه فوراً
                </p>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  المتجر: <span className="font-bold text-gray-900 dark:text-white">{verificationRequest.storeName}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  المالك: <span className="font-bold text-gray-900 dark:text-white">{verificationRequest.owner.name}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-green-500"
                  placeholder="ملاحظات للمالك..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تأكيد الموافقة
                </Button>
                <Button
                  onClick={() => setShowApproveModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                رفض الطلب
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  ⚠️ تحذير: سيتم رفض الطلب بشكل نهائي
                </p>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  المتجر: <span className="font-bold text-gray-900 dark:text-white">{verificationRequest.storeName}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  سبب الرفض <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-red-500"
                  placeholder="اكتب سبب الرفض..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleReject}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white"
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  تأكيد الرفض
                </Button>
                <Button
                  onClick={() => setShowRejectModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Request Info Modal */}
      {showRequestInfoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400">
                طلب معلومات إضافية
              </h3>
              <button
                onClick={() => setShowRequestInfoModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  ℹ️ سيتم إرسال طلب للمالك لتقديم المعلومات المطلوبة
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المعلومات المطلوبة
                </label>
                <textarea
                  rows={4}
                  value={requestedInfo}
                  onChange={(e) => setRequestedInfo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-orange-500"
                  placeholder="اكتب المعلومات أو المستندات المطلوبة..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  المستندات الناقصة
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={missingDocs.businessLicense}
                      onChange={(e) => setMissingDocs({ ...missingDocs, businessLicense: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">رخصة العمل التجارية</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={missingDocs.taxId}
                      onChange={(e) => setMissingDocs({ ...missingDocs, taxId: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">الرقم الضريبي</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={missingDocs.nationalId}
                      onChange={(e) => setMissingDocs({ ...missingDocs, nationalId: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">الهوية الشخصية</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={missingDocs.other}
                      onChange={(e) => setMissingDocs({ ...missingDocs, other: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">مستندات أخرى</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleRequestInfo}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white"
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  إرسال الطلب
                </Button>
                <Button
                  onClick={() => setShowRequestInfoModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
