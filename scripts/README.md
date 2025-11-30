# 📜 Scripts Documentation

هذا المجلد يحتوي على جميع الـ scripts المطلوبة لإدارة البنية التحتية لمنصة درعا.

---

## 📁 **محتويات المجلد**

### **1. Secrets Management**
- `create-secrets.sh` - إنشاء جميع الـ secrets المطلوبة

### **2. MongoDB Management**
- `generate-mongodb-keyfile.sh` - إنشاء keyfile للـ replica set
- `init-replica-set.sh` - تهيئة MongoDB replica set
- `backup-mongodb.sh` - Backup MongoDB database
- `restore-mongodb.sh` - Restore MongoDB من backup

### **3. Backup Management**
- `setup-backup-cron.sh` - إعداد cron job للـ backup التلقائي

### **4. MongoDB Initialization**
- `mongo-init/01-create-users.js` - إنشاء مستخدمي MongoDB

---

## 🚀 **الاستخدام**

### **1. إنشاء Secrets (خطوة أولى)**

```bash
chmod +x scripts/create-secrets.sh
./scripts/create-secrets.sh
```

**ماذا يفعل:**
- ينشئ مجلد `secrets/`
- يولّد passwords عشوائية آمنة
- ينشئ ملفات secrets منفصلة
- يضبط الصلاحيات (chmod 600)

**الملفات المُنشأة:**
- `secrets/mongo_root_password.txt`
- `secrets/mongo_app_password.txt`
- `secrets/mongo_backup_password.txt`
- `secrets/redis_password.txt`
- `secrets/jwt_secret.txt`
- `secrets/jwt_refresh_secret.txt`
- `secrets/cookie_secret.txt`

---

### **2. إنشاء MongoDB Keyfile (للـ Replica Set)**

```bash
chmod +x scripts/generate-mongodb-keyfile.sh
./scripts/generate-mongodb-keyfile.sh
```

**ماذا يفعل:**
- ينشئ keyfile عشوائي (756 bytes)
- يضبط الصلاحيات (chmod 400)
- يحفظه في `scripts/mongodb-keyfile`

**متى تستخدمه:**
- قبل بدء MongoDB replica set
- مرة واحدة فقط

---

### **3. تهيئة MongoDB Replica Set**

```bash
# بعد بدء الـ containers
docker-compose -f docker-compose.production.yml up -d

# انتظر 30 ثانية
sleep 30

# تهيئة replica set
chmod +x scripts/init-replica-set.sh
./scripts/init-replica-set.sh
```

**ماذا يفعل:**
- يهيئ replica set باسم `rs0`
- يضيف 3 nodes:
  - Primary: `daraa-mongodb-primary:27017`
  - Secondary: `daraa-mongodb-secondary:27017`
  - Arbiter: `daraa-mongodb-arbiter:27017`
- يتحقق من الحالة

**متى تستخدمه:**
- بعد بدء MongoDB containers لأول مرة
- مرة واحدة فقط

---

### **4. Backup MongoDB**

```bash
chmod +x scripts/backup-mongodb.sh
./scripts/backup-mongodb.sh
```

**ماذا يفعل:**
- يأخذ backup كامل من MongoDB
- يضغطه (gzip + tar.gz)
- يحفظه في `backups/mongodb/`
- يحذف backups أقدم من 30 يوم
- (اختياري) يرفعه على S3

**الخيارات:**
```bash
# Backup عادي
./scripts/backup-mongodb.sh

# Backup مع رفع على S3
ENABLE_S3_UPLOAD=true ./scripts/backup-mongodb.sh
```

**متى تستخدمه:**
- يدوياً عند الحاجة
- تلقائياً عبر cron job

---

### **5. إعداد Backup Cron Job**

```bash
chmod +x scripts/setup-backup-cron.sh
./scripts/setup-backup-cron.sh
```

**ماذا يفعل:**
- يسألك عن تكرار الـ backup
- يضيف cron job
- يعرض الـ crontab الحالي

**الخيارات:**
1. كل 6 ساعات (recommended for production)
2. يومياً الساعة 2 صباحاً
3. يومياً الساعة 3 صباحاً
4. أسبوعياً (الأحد الساعة 2 صباحاً)
5. Custom

**متى تستخدمه:**
- بعد النشر على الإنتاج
- مرة واحدة فقط

---

## 📝 **أمثلة الاستخدام**

### **Setup كامل من الصفر (Production):**

```bash
# 1. إنشاء secrets
./scripts/create-secrets.sh

# 2. إنشاء MongoDB keyfile
./scripts/generate-mongodb-keyfile.sh

# 3. بدء containers
docker-compose -f docker-compose.production.yml up -d

# 4. انتظر حتى تبدأ الـ containers
sleep 30

# 5. تهيئة replica set
./scripts/init-replica-set.sh

# 6. إعداد backup cron job
./scripts/setup-backup-cron.sh

# 7. اختبار backup
./scripts/backup-mongodb.sh

# 8. التحقق من الحالة
docker-compose -f docker-compose.production.yml ps
```

---

### **Backup يدوي:**

```bash
# Backup عادي
./scripts/backup-mongodb.sh

# عرض الـ backups
ls -lh backups/mongodb/

# Restore من backup
./scripts/restore-mongodb.sh backups/mongodb/backup-2024-11-29.tar.gz
```

---

### **التحقق من Replica Set:**

```bash
# الحالة
docker exec daraa-mongodb-primary mongosh -u admin -p DaraaSecurePassword2024 --authenticationDatabase admin --eval "rs.status()"

# التكوين
docker exec daraa-mongodb-primary mongosh -u admin -p DaraaSecurePassword2024 --authenticationDatabase admin --eval "rs.conf()"

# الأعضاء
docker exec daraa-mongodb-primary mongosh -u admin -p DaraaSecurePassword2024 --authenticationDatabase admin --eval "rs.isMaster()"
```

---

## ⚠️ **ملاحظات مهمة**

### **Secrets:**
- ❌ **لا تشارك الـ secrets مع أحد**
- ❌ **لا ترفعها على Git**
- ✅ احفظها في مكان آمن
- ✅ استخدم passwords قوية

### **MongoDB Keyfile:**
- ❌ **لا تغيّره بعد التهيئة**
- ❌ **لا ترفعه على Git**
- ✅ استخدم نفس الـ keyfile لجميع الـ nodes
- ✅ الصلاحيات يجب أن تكون 400

### **Backups:**
- ✅ اختبر الـ restore بانتظام
- ✅ احفظ الـ backups في مكان آمن
- ✅ استخدم S3 أو cloud storage
- ✅ راقب مساحة القرص

### **Cron Jobs:**
- ✅ تحقق من الـ logs بانتظام
- ✅ تأكد من نجاح الـ backups
- ✅ راقب استهلاك الموارد

---

## 🔧 **استكشاف الأخطاء**

### **Script لا يعمل:**
```bash
# تأكد من الصلاحيات
chmod +x scripts/script-name.sh

# شغّله مع verbose output
bash -x scripts/script-name.sh
```

### **Replica Set لا يتهيأ:**
```bash
# تحقق من الـ containers
docker-compose -f docker-compose.production.yml ps

# تحقق من الـ logs
docker logs daraa-mongodb-primary

# أعد المحاولة
./scripts/init-replica-set.sh
```

### **Backup يفشل:**
```bash
# تحقق من المساحة
df -h

# تحقق من الصلاحيات
ls -la backups/mongodb/

# تحقق من MongoDB connection
docker exec daraa-mongodb mongosh -u admin -p DaraaSecurePassword2024 --authenticationDatabase admin --eval "db.version()"
```

---

## 📞 **الدعم**

إذا واجهت أي مشكلة:
1. راجع logs: `docker-compose logs -f`
2. راجع التوثيق في `DEPLOYMENT_GUIDE.md`
3. افتح issue على GitHub

---

**حظاً موفقاً! 🚀**

