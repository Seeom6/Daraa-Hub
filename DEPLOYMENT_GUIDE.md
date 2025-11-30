# 🚀 دليل النشر الشامل - منصة درعا

**تاريخ:** 2025-11-29  
**الإصدار:** 2.0 (Production-Ready)

---

## 📋 **المتطلبات**

### **1. البرمجيات المطلوبة:**
- Docker 20.10+
- Docker Compose 2.0+
- Git
- OpenSSL (لإنشاء الـ secrets)

### **2. الموارد المطلوبة:**

#### **Development (docker-compose.yml):**
- CPU: 4 cores
- RAM: 8GB
- Disk: 50GB

#### **Production (docker-compose.production.yml):**
- CPU: 8 cores
- RAM: 16GB
- Disk: 200GB (مع مساحة للـ backups)

---

## 🎯 **خيارات النشر**

### **Option 1: Development (Single Instance)**
```bash
# استخدم docker-compose.yml
docker-compose up -d
```

**المميزات:**
- ✅ سهل الإعداد
- ✅ موارد أقل
- ✅ مناسب للتطوير والاختبار

**العيوب:**
- ❌ Single point of failure
- ❌ لا يوجد load balancing
- ❌ لا يوجد monitoring

---

### **Option 2: Production (High Availability)**
```bash
# استخدم docker-compose.production.yml
docker-compose -f docker-compose.production.yml up -d
```

**المميزات:**
- ✅ MongoDB Replica Set (3 nodes)
- ✅ Load Balancer (Nginx)
- ✅ Multiple App Instances (2)
- ✅ Monitoring Stack (Prometheus + Grafana)
- ✅ High Availability
- ✅ Auto Failover

**العيوب:**
- ⚠️ يحتاج موارد أكثر
- ⚠️ إعداد أكثر تعقيداً

---

## 📝 **خطوات النشر (Development)**

### **الخطوة 1: Clone المشروع**
```bash
git clone https://github.com/your-repo/daraa.git
cd daraa
```

### **الخطوة 2: تحديث .env**
```bash
cd server
cp .env.example .env
# عدّل الملف حسب بيئتك
nano .env
```

**تأكد من تحديث:**
- `MONGO_ROOT_PASSWORD`
- `MONGO_APP_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`

### **الخطوة 3: بناء وتشغيل الـ Containers**
```bash
cd ..
docker-compose up -d
```

### **الخطوة 4: التحقق من الحالة**
```bash
# التحقق من الـ containers
docker-compose ps

# التحقق من الـ logs
docker-compose logs -f

# التحقق من الصحة
curl http://localhost:3001/api/health
```

### **الخطوة 5: إنشاء حسابات الاختبار**
```bash
cd server
npm run create-test-accounts
```

---

## 🚀 **خطوات النشر (Production)**

### **الخطوة 1: إنشاء Secrets**
```bash
# إنشاء secrets directory
chmod +x scripts/create-secrets.sh
./scripts/create-secrets.sh
```

### **الخطوة 2: إنشاء MongoDB Keyfile**
```bash
chmod +x scripts/generate-mongodb-keyfile.sh
./scripts/generate-mongodb-keyfile.sh
```

### **الخطوة 3: تحديث .env.production**
```bash
cp server/.env.production server/.env
# عدّل الملف حسب بيئتك
nano server/.env
```

**تأكد من تغيير:**
- جميع الـ passwords الافتراضية
- `APP_URL` و `CLIENT_URL`
- AWS credentials (إذا كنت تستخدم S3)
- Twilio credentials (إذا كنت تستخدم SMS)

### **الخطوة 4: بناء وتشغيل الـ Containers**
```bash
docker-compose -f docker-compose.production.yml up -d
```

### **الخطوة 5: تهيئة MongoDB Replica Set**
```bash
# انتظر 30 ثانية حتى تبدأ الـ containers
sleep 30

# تهيئة replica set
chmod +x scripts/init-replica-set.sh
./scripts/init-replica-set.sh
```

### **الخطوة 6: التحقق من Replica Set**
```bash
docker exec daraa-mongodb-primary mongosh -u admin -p DaraaSecurePassword2024 --authenticationDatabase admin --eval "rs.status()"
```

### **الخطوة 7: إعداد Backup Cron Job**
```bash
chmod +x scripts/setup-backup-cron.sh
./scripts/setup-backup-cron.sh
```

### **الخطوة 8: التحقق من Monitoring**
```bash
# Prometheus
open http://localhost:9090

# Grafana
open http://localhost:3000
# Username: admin
# Password: admin (غيّره فوراً!)
```

---

## 🔍 **التحقق من النشر**

### **1. التحقق من الـ Containers**
```bash
docker-compose -f docker-compose.production.yml ps
```

**يجب أن ترى:**
- ✅ daraa-mongodb-primary (healthy)
- ✅ daraa-mongodb-secondary (healthy)
- ✅ daraa-mongodb-arbiter (healthy)
- ✅ daraa-redis-master (healthy)
- ✅ daraa-server-1 (healthy)
- ✅ daraa-server-2 (healthy)
- ✅ daraa-nginx (healthy)
- ✅ daraa-prometheus (running)
- ✅ daraa-grafana (running)
- ✅ daraa-mongodb-exporter (running)
- ✅ daraa-redis-exporter (running)

### **2. التحقق من MongoDB Replica Set**
```bash
docker exec daraa-mongodb-primary mongosh -u admin -p DaraaSecurePassword2024 --authenticationDatabase admin --eval "rs.status()"
```

**يجب أن ترى:**
- Primary: daraa-mongodb-primary (state: 1)
- Secondary: daraa-mongodb-secondary (state: 2)
- Arbiter: daraa-mongodb-arbiter (state: 7)

### **3. التحقق من Load Balancer**
```bash
# اختبار عدة مرات - يجب أن يوزع بين server-1 و server-2
for i in {1..10}; do
  curl -s http://localhost/api/health | grep -o "server-[12]"
done
```

### **4. التحقق من Monitoring**
```bash
# Prometheus targets
curl http://localhost:9090/api/v1/targets

# Grafana health
curl http://localhost:3000/api/health
```

---

## 📊 **الوصول إلى الخدمات**

| الخدمة | URL | Credentials |
|--------|-----|-------------|
| **API** | http://localhost/api | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin |
| **MongoDB Primary** | localhost:27017 | admin / DaraaSecurePassword2024 |
| **MongoDB Secondary** | localhost:27018 | admin / DaraaSecurePassword2024 |
| **Redis** | localhost:6379 | DaraaRedisPassword2024 |

---

## 🔧 **الصيانة**

### **Backup**
```bash
# Backup يدوي
./scripts/backup-mongodb.sh

# عرض الـ backups
ls -lh backups/mongodb/

# Restore من backup
./scripts/restore-mongodb.sh backups/mongodb/backup-2024-11-29.tar.gz
```

### **Logs**
```bash
# عرض logs لجميع الخدمات
docker-compose -f docker-compose.production.yml logs -f

# عرض logs لخدمة معينة
docker-compose -f docker-compose.production.yml logs -f daraa-server-1

# عرض آخر 100 سطر
docker-compose -f docker-compose.production.yml logs --tail=100 daraa-mongodb-primary
```

### **Scaling**
```bash
# إضافة server instance جديد
docker-compose -f docker-compose.production.yml up -d --scale server=3

# تحديث Nginx config لإضافة الـ instance الجديد
```

### **Updates**
```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose -f docker-compose.production.yml build

# Restart with zero downtime
docker-compose -f docker-compose.production.yml up -d --no-deps --build server-1
# انتظر حتى يصبح healthy
docker-compose -f docker-compose.production.yml up -d --no-deps --build server-2
```

---

## 🚨 **استكشاف الأخطاء**

### **MongoDB Replica Set لا يعمل**
```bash
# تحقق من الحالة
docker exec daraa-mongodb-primary mongosh -u admin -p DaraaSecurePassword2024 --authenticationDatabase admin --eval "rs.status()"

# إعادة تهيئة
./scripts/init-replica-set.sh
```

### **Load Balancer لا يوزع الطلبات**
```bash
# تحقق من Nginx logs
docker logs daraa-nginx

# تحقق من upstream servers
docker exec daraa-nginx nginx -t
```

### **Monitoring لا يعمل**
```bash
# تحقق من Prometheus targets
curl http://localhost:9090/api/v1/targets

# إعادة تشغيل Prometheus
docker-compose -f docker-compose.production.yml restart prometheus
```

---

## 📞 **الدعم**

إذا واجهت أي مشكلة:
1. راجع logs: `docker-compose logs -f`
2. تحقق من health checks: `docker-compose ps`
3. راجع التوثيق في `docs/`
4. افتح issue على GitHub

---

**حظاً موفقاً! 🚀**

