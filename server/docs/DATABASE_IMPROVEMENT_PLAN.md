# 🚀 خطة تحسين شاملة للبنية التحتية

**المدة الإجمالية:** 4-6 أسابيع  
**الأولوية:** عالية جداً  
**الهدف:** رفع التقييم من 5.3/10 إلى 9/10

---

## 📅 **المراحل الزمنية**

### **المرحلة 1: الأمان والاستقرار (الأسبوع 1-2)** 🔴 **حرج**

#### **1.1 تأمين MongoDB (3 أيام)**

**المهام:**
- [ ] إضافة Authentication للـ MongoDB
- [ ] إنشاء users مع roles محددة (admin, app, backup, readonly)
- [ ] تفعيل Authorization
- [ ] إضافة TLS/SSL للاتصالات
- [ ] تقييد الوصول للـ MongoDB (bind to localhost فقط)

**الملفات المطلوبة:**
```yaml
# docker-compose.yml
mongodb:
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
  command: --auth --tlsMode requireTLS --tlsCertificateKeyFile /etc/ssl/mongodb.pem
```

**Scripts:**
```javascript
// scripts/setup-mongodb-users.js
db.createUser({
  user: "daraa_app",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "daraa" },
    { role: "dbAdmin", db: "daraa" }
  ]
});

db.createUser({
  user: "daraa_backup",
  pwd: "backup_password",
  roles: [{ role: "backup", db: "admin" }]
});

db.createUser({
  user: "daraa_readonly",
  pwd: "readonly_password",
  roles: [{ role: "read", db: "daraa" }]
});
```

---

#### **1.2 Backup Strategy (2 أيام)**

**المهام:**
- [ ] إنشاء automated backup script
- [ ] جدولة backups يومية (cron job)
- [ ] تخزين backups في S3/MinIO
- [ ] اختبار restore process
- [ ] إنشاء backup retention policy (30 يوم)

**Scripts:**
```bash
# scripts/backup-mongodb.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
S3_BUCKET="daraa-backups"

# Create backup
mongodump --uri="mongodb://daraa_backup:password@localhost:27017/daraa" \
  --out="$BACKUP_DIR/$DATE" \
  --gzip

# Upload to S3
aws s3 sync "$BACKUP_DIR/$DATE" "s3://$S3_BUCKET/mongodb/$DATE/"

# Delete local backup older than 7 days
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} \;

# Delete S3 backups older than 30 days
aws s3 ls "s3://$S3_BUCKET/mongodb/" | while read -r line; do
  createDate=$(echo $line | awk '{print $1" "$2}')
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "30 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    folder=$(echo $line | awk '{print $4}')
    aws s3 rm "s3://$S3_BUCKET/mongodb/$folder" --recursive
  fi
done
```

**Cron Job:**
```bash
# Daily backup at 2 AM
0 2 * * * /opt/daraa/scripts/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
```

---

#### **1.3 Resource Limits (1 يوم)**

**المهام:**
- [ ] إضافة resource limits للـ containers
- [ ] تحديد memory limits
- [ ] تحديد CPU limits
- [ ] إضافة restart policies

**docker-compose.yml:**
```yaml
services:
  mongodb:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
    restart: unless-stopped
    
  server:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
    restart: unless-stopped
```

---

#### **1.4 Secrets Management (1 يوم)**

**المهام:**
- [ ] استخدام Docker Secrets أو Vault
- [ ] إزالة secrets من environment variables
- [ ] إنشاء .env.production مع secrets
- [ ] إضافة .env.production إلى .gitignore

**docker-compose.yml:**
```yaml
services:
  mongodb:
    secrets:
      - mongo_root_password
      - mongo_app_password
    environment:
      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/mongo_root_password

secrets:
  mongo_root_password:
    file: ./secrets/mongo_root_password.txt
  mongo_app_password:
    file: ./secrets/mongo_app_password.txt
```

---

### **المرحلة 2: تحسين الأداء (الأسبوع 2-3)**

#### **2.1 Connection Pooling (1 يوم)**

**المهام:**
- [ ] إضافة connection pooling settings
- [ ] تحسين retry strategy
- [ ] إضافة timeout settings
- [ ] اختبار الأداء

**app.module.ts:**
```typescript
MongooseModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('database.uri'),
    // Connection Pool Settings
    maxPoolSize: 50,        // Max connections
    minPoolSize: 10,        // Min connections
    maxIdleTimeMS: 30000,   // 30 seconds idle timeout
    
    // Timeout Settings
    serverSelectionTimeoutMS: 5000,  // 5 seconds
    socketTimeoutMS: 45000,          // 45 seconds
    connectTimeoutMS: 10000,         // 10 seconds
    
    // Retry Settings
    retryWrites: true,
    retryReads: true,
    
    // Write Concern
    w: 'majority',
    wtimeoutMS: 5000,
    
    // Read Preference
    readPreference: 'primaryPreferred',
    
    // Auto Index
    autoIndex: process.env.NODE_ENV !== 'production',
  }),
})
```

---

#### **2.2 Indexes Optimization (3 أيام)**

**المهام:**
- [ ] تحليل slow queries
- [ ] إضافة compound indexes
- [ ] إضافة TTL indexes
- [ ] إضافة partial indexes
- [ ] اختبار الأداء

**Compound Indexes:**
```typescript
// wallet-transaction.schema.ts
WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ walletId: 1, type: 1, status: 1 });
WalletTransactionSchema.index({ status: 1, createdAt: -1 });

// notification.schema.ts
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, type: 1, createdAt: -1 });

// cart.schema.ts
CartSchema.index({ customerId: 1, isActive: 1 });
CartSchema.index({ customerId: 1, 'items.productId': 1 });

// commission.schema.ts
CommissionSchema.index({ storeId: 1, status: 1, createdAt: -1 });
CommissionSchema.index({ orderId: 1 });
```

**TTL Indexes:**
```typescript
// audit-log.schema.ts (تفعيل TTL)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

// notification.schema.ts
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// user-activity.schema.ts
UserActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 }); // 180 days
```

**Partial Indexes:**
```typescript
// order.schema.ts
OrderSchema.index(
  { customerId: 1, orderStatus: 1 },
  { partialFilterExpression: { orderStatus: { $in: ['pending', 'processing'] } } }
);

// payment.schema.ts
PaymentSchema.index(
  { storeId: 1, status: 1 },
  { partialFilterExpression: { status: 'pending' } }
);
```

---

#### **2.3 Caching Strategy (2 أيام)**

**المهام:**
- [ ] إضافة Redis caching للـ queries المتكررة
- [ ] Cache invalidation strategy
- [ ] Cache warming
- [ ] اختبار الأداء

**cache.service.ts:**
```typescript
@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.getClient().get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.getClient().setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.getClient().del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.getClient().keys(pattern);
    if (keys.length > 0) {
      await this.redis.getClient().del(...keys);
    }
  }
}
```

**Usage:**
```typescript
// product.service.ts
async findById(id: string): Promise<Product> {
  const cacheKey = `product:${id}`;
  
  // Try cache first
  const cached = await this.cacheService.get<Product>(cacheKey);
  if (cached) return cached;
  
  // Query database
  const product = await this.productRepository.findById(id);
  
  // Cache result
  await this.cacheService.set(cacheKey, product, 3600); // 1 hour
  
  return product;
}

async update(id: string, dto: UpdateProductDto): Promise<Product> {
  const product = await this.productRepository.update(id, dto);

  // Invalidate cache
  await this.cacheService.del(`product:${id}`);
  await this.cacheService.invalidatePattern(`products:store:${product.storeId}:*`);

  return product;
}
```

---

### **المرحلة 3: High Availability (الأسبوع 3-4)**

#### **3.1 MongoDB Replica Set (3 أيام)**

**المهام:**
- [ ] إنشاء MongoDB Replica Set (3 nodes)
- [ ] تكوين Primary/Secondary/Arbiter
- [ ] اختبار Failover
- [ ] تحديث Connection String

**docker-compose.yml:**
```yaml
services:
  mongodb-primary:
    image: mongo:7.0
    container_name: daraa-mongodb-primary
    command: --replSet rs0 --bind_ip_all
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb-primary-data:/data/db
    networks:
      - daraa-network
    ports:
      - "27017:27017"

  mongodb-secondary:
    image: mongo:7.0
    container_name: daraa-mongodb-secondary
    command: --replSet rs0 --bind_ip_all
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb-secondary-data:/data/db
    networks:
      - daraa-network
    ports:
      - "27018:27017"

  mongodb-arbiter:
    image: mongo:7.0
    container_name: daraa-mongodb-arbiter
    command: --replSet rs0 --bind_ip_all
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    networks:
      - daraa-network
    ports:
      - "27019:27017"

volumes:
  mongodb-primary-data:
  mongodb-secondary-data:
```

**Replica Set Initialization:**
```javascript
// scripts/init-replica-set.js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb-primary:27017", priority: 2 },
    { _id: 1, host: "mongodb-secondary:27017", priority: 1 },
    { _id: 2, host: "mongodb-arbiter:27017", arbiterOnly: true }
  ]
});
```

**Connection String:**
```
mongodb://admin:password@mongodb-primary:27017,mongodb-secondary:27017,mongodb-arbiter:27017/daraa?replicaSet=rs0&authSource=admin
```

---

#### **3.2 Redis Cluster (2 أيام)**

**المهام:**
- [ ] إضافة Redis إلى Docker Compose
- [ ] تكوين Redis Sentinel للـ HA
- [ ] اختبار Failover
- [ ] تحديث Redis Configuration

**docker-compose.yml:**
```yaml
services:
  redis-master:
    image: redis:7-alpine
    container_name: daraa-redis-master
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 2gb --maxmemory-policy allkeys-lru
    volumes:
      - redis-master-data:/data
    networks:
      - daraa-network
    ports:
      - "6379:6379"

  redis-replica:
    image: redis:7-alpine
    container_name: daraa-redis-replica
    command: redis-server --requirepass ${REDIS_PASSWORD} --slaveof redis-master 6379 --masterauth ${REDIS_PASSWORD}
    volumes:
      - redis-replica-data:/data
    networks:
      - daraa-network
    depends_on:
      - redis-master

  redis-sentinel:
    image: redis:7-alpine
    container_name: daraa-redis-sentinel
    command: redis-sentinel /etc/redis/sentinel.conf
    volumes:
      - ./config/sentinel.conf:/etc/redis/sentinel.conf
    networks:
      - daraa-network
    depends_on:
      - redis-master
      - redis-replica

volumes:
  redis-master-data:
  redis-replica-data:
```

---

#### **3.3 Load Balancer (2 أيام)**

**المهام:**
- [ ] إضافة Nginx Load Balancer
- [ ] تكوين multiple server instances
- [ ] Health checks
- [ ] SSL/TLS termination

**docker-compose.yml:**
```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: daraa-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    networks:
      - daraa-network
    depends_on:
      - server-1
      - server-2

  server-1:
    build: ./server
    container_name: daraa-server-1
    environment:
      NODE_ENV: production
      PORT: 3001
    networks:
      - daraa-network

  server-2:
    build: ./server
    container_name: daraa-server-2
    environment:
      NODE_ENV: production
      PORT: 3001
    networks:
      - daraa-network
```

**nginx.conf:**
```nginx
upstream daraa_backend {
    least_conn;
    server server-1:3001 max_fails=3 fail_timeout=30s;
    server server-2:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name daraa.com;

    location / {
        proxy_pass http://daraa_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Health check
        proxy_next_upstream error timeout http_500 http_502 http_503;
    }
}
```

---

### **المرحلة 4: Monitoring & Logging (الأسبوع 4-5)**

#### **4.1 Monitoring Stack (3 أيام)**

**المهام:**
- [ ] إضافة Prometheus للـ metrics
- [ ] إضافة Grafana للـ dashboards
- [ ] إضافة MongoDB Exporter
- [ ] إضافة Redis Exporter
- [ ] إنشاء dashboards

**docker-compose.yml:**
```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: daraa-prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    networks:
      - daraa-network

  grafana:
    image: grafana/grafana:latest
    container_name: daraa-grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"
    networks:
      - daraa-network
    depends_on:
      - prometheus

  mongodb-exporter:
    image: percona/mongodb_exporter:latest
    container_name: daraa-mongodb-exporter
    command:
      - '--mongodb.uri=mongodb://admin:${MONGO_ROOT_PASSWORD}@mongodb-primary:27017'
    ports:
      - "9216:9216"
    networks:
      - daraa-network
    depends_on:
      - mongodb-primary

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: daraa-redis-exporter
    environment:
      REDIS_ADDR: redis-master:6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    ports:
      - "9121:9121"
    networks:
      - daraa-network
    depends_on:
      - redis-master

volumes:
  prometheus-data:
  grafana-data:
```

---

#### **4.2 Logging Stack (2 أيام)**

**المهام:**
- [ ] إضافة ELK Stack (Elasticsearch, Logstash, Kibana)
- [ ] تكوين log aggregation
- [ ] إنشاء log dashboards
- [ ] تكوين log retention

**docker-compose.yml:**
```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: daraa-elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - daraa-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: daraa-logstash
    volumes:
      - ./logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    networks:
      - daraa-network
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: daraa-kibana
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    ports:
      - "5601:5601"
    networks:
      - daraa-network
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

**logstash.conf:**
```
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [level] == "error" {
    mutate {
      add_tag => ["error"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "daraa-logs-%{+YYYY.MM.dd}"
  }
}
```

---

#### **4.3 Application Monitoring (2 أيام)**

**المهام:**
- [ ] إضافة APM (Application Performance Monitoring)
- [ ] تتبع slow queries
- [ ] تتبع errors
- [ ] إنشاء alerts

**NestJS Logger:**
```typescript
// logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
```

**Query Monitoring:**
```typescript
// database.interceptor.ts
@Injectable()
export class DatabaseInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        // Log slow queries (> 1 second)
        if (duration > 1000) {
          this.logger.warn(
            `Slow query detected: ${request.url} took ${duration}ms`,
            'DatabaseInterceptor'
          );
        }
      }),
      catchError((error) => {
        this.logger.error(
          `Database error: ${error.message}`,
          error.stack,
          'DatabaseInterceptor'
        );
        throw error;
      })
    );
  }
}
```

---

### **المرحلة 5: Data Management (الأسبوع 5-6)**

#### **5.1 Data Archiving (2 أيام)**

**المهام:**
- [ ] إنشاء archiving strategy
- [ ] نقل البيانات القديمة إلى archive database
- [ ] جدولة archiving jobs
- [ ] اختبار restore من archive

**archiving.service.ts:**
```typescript
@Injectable()
export class ArchivingService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly logger: CustomLogger,
  ) {}

  @Cron('0 2 * * 0') // Every Sunday at 2 AM
  async archiveOldOrders() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    try {
      // Find completed orders older than 6 months
      const oldOrders = await this.orderModel.find({
        orderStatus: 'delivered',
        updatedAt: { $lt: sixMonthsAgo },
      });

      if (oldOrders.length === 0) {
        this.logger.log('No orders to archive', 'ArchivingService');
        return;
      }

      // Archive to separate collection
      const archiveModel = this.orderModel.db.collection('orders_archive');
      await archiveModel.insertMany(oldOrders.map(o => o.toObject()));

      // Delete from main collection
      await this.orderModel.deleteMany({
        _id: { $in: oldOrders.map(o => o._id) },
      });

      this.logger.log(
        `Archived ${oldOrders.length} orders`,
        'ArchivingService'
      );
    } catch (error) {
      this.logger.error(
        `Error archiving orders: ${error.message}`,
        error.stack,
        'ArchivingService'
      );
    }
  }

  @Cron('0 3 * * 0') // Every Sunday at 3 AM
  async archiveOldNotifications() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    try {
      const result = await this.notificationModel.deleteMany({
        createdAt: { $lt: threeMonthsAgo },
        isRead: true,
      });

      this.logger.log(
        `Deleted ${result.deletedCount} old notifications`,
        'ArchivingService'
      );
    } catch (error) {
      this.logger.error(
        `Error deleting notifications: ${error.message}`,
        error.stack,
        'ArchivingService'
      );
    }
  }
}
```

---

#### **5.2 Data Cleanup Jobs (1 يوم)**

**المهام:**
- [ ] تنظيف expired OTPs
- [ ] تنظيف abandoned carts
- [ ] تنظيف expired sessions
- [ ] جدولة cleanup jobs

**cleanup.service.ts:**
```typescript
@Injectable()
export class CleanupService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly logger: CustomLogger,
  ) {}

  @Cron('0 * * * *') // Every hour
  async cleanupExpiredOTPs() {
    try {
      const result = await this.otpModel.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      this.logger.log(
        `Deleted ${result.deletedCount} expired OTPs`,
        'CleanupService'
      );
    } catch (error) {
      this.logger.error(
        `Error cleaning up OTPs: ${error.message}`,
        error.stack,
        'CleanupService'
      );
    }
  }

  @Cron('0 4 * * *') // Every day at 4 AM
  async cleanupAbandonedCarts() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const result = await this.cartModel.deleteMany({
        updatedAt: { $lt: sevenDaysAgo },
        isActive: false,
      });

      this.logger.log(
        `Deleted ${result.deletedCount} abandoned carts`,
        'CleanupService'
      );
    } catch (error) {
      this.logger.error(
        `Error cleaning up carts: ${error.message}`,
        error.stack,
        'CleanupService'
      );
    }
  }
}
```

---

#### **5.3 Database Maintenance (2 أيام)**

**المهام:**
- [ ] إنشاء maintenance scripts
- [ ] Reindex collections
- [ ] Compact databases
- [ ] Analyze query performance
- [ ] جدولة maintenance jobs

**maintenance.sh:**
```bash
#!/bin/bash

# Database Maintenance Script
# Run weekly on Sunday at 1 AM

MONGO_URI="mongodb://admin:password@localhost:27017/daraa?authSource=admin"

echo "Starting database maintenance..."

# 1. Reindex all collections
echo "Reindexing collections..."
mongosh "$MONGO_URI" --eval "
  db.getCollectionNames().forEach(function(collection) {
    print('Reindexing: ' + collection);
    db[collection].reIndex();
  });
"

# 2. Compact database
echo "Compacting database..."
mongosh "$MONGO_URI" --eval "db.runCommand({ compact: 'orders' });"
mongosh "$MONGO_URI" --eval "db.runCommand({ compact: 'products' });"
mongosh "$MONGO_URI" --eval "db.runCommand({ compact: 'notifications' });"

# 3. Analyze query performance
echo "Analyzing slow queries..."
mongosh "$MONGO_URI" --eval "
  db.setProfilingLevel(1, { slowms: 100 });
  db.system.profile.find().sort({ ts: -1 }).limit(10).pretty();
"

# 4. Check database stats
echo "Database statistics:"
mongosh "$MONGO_URI" --eval "db.stats();"

echo "Maintenance completed!"
```

**Cron Job:**
```bash
# Weekly maintenance on Sunday at 1 AM
0 1 * * 0 /opt/daraa/scripts/maintenance.sh >> /var/log/mongodb-maintenance.log 2>&1
```

---

### **المرحلة 6: Testing & Documentation (الأسبوع 6)**

#### **6.1 Performance Testing (2 أيام)**

**المهام:**
- [ ] Load testing مع Apache JMeter
- [ ] Stress testing
- [ ] اختبار Failover
- [ ] اختبار Backup/Restore
- [ ] توثيق النتائج

**JMeter Test Plan:**
```xml
<!-- jmeter-test-plan.jmx -->
<jmeterTestPlan>
  <hashTree>
    <TestPlan>
      <stringProp name="TestPlan.comments">Daraa Load Test</stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup>
        <stringProp name="ThreadGroup.num_threads">1000</stringProp>
        <stringProp name="ThreadGroup.ramp_time">60</stringProp>
        <stringProp name="ThreadGroup.duration">300</stringProp>
      </ThreadGroup>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

**Load Test Script:**
```bash
#!/bin/bash

# Run load test
jmeter -n -t jmeter-test-plan.jmx -l results.jtl -e -o report/

# Analyze results
echo "Load Test Results:"
echo "==================="
cat report/statistics.json | jq '.Total | {
  samples: .sampleCount,
  errorRate: .errorPct,
  avgResponseTime: .meanResTime,
  p95ResponseTime: .pct3ResTime,
  throughput: .throughput
}'
```

---

#### **6.2 Documentation (2 أيام)**

**المهام:**
- [ ] توثيق Database Schema
- [ ] توثيق Indexes
- [ ] توثيق Backup/Restore procedures
- [ ] توثيق Monitoring dashboards
- [ ] توثيق Troubleshooting guide

**DATABASE_SCHEMA.md:**
```markdown
# Database Schema Documentation

## Collections Overview

### 1. Accounts & Profiles
- **account** (42 fields) - User accounts
- **security-profile** (15 fields) - Security settings
- **admin-profile** (8 fields) - Admin profiles
- **store-owner-profile** (12 fields) - Store owner profiles
- **customer-profile** (10 fields) - Customer profiles
- **courier-profile** (9 fields) - Courier profiles

### 2. E-commerce
- **product** (25 fields) - Products catalog
- **product-variant** (12 fields) - Product variants
- **category** (8 fields) - Product categories
- **inventory** (10 fields) - Stock management
- **order** (30 fields) - Customer orders
- **cart** (8 fields) - Shopping carts
- **payment** (15 fields) - Payment records

### 3. Reviews & Ratings
- **review** (12 fields) - Product reviews
- **dispute** (15 fields) - Order disputes

### 4. Loyalty & Rewards
- **coupon** (18 fields) - Discount coupons
- **offer** (15 fields) - Special offers
- **points-transaction** (10 fields) - Loyalty points
- **referral** (12 fields) - Referral program
- **wallet** (12 fields) - User wallets
- **wallet-transaction** (15 fields) - Wallet transactions

### 5. Delivery & Logistics
- **delivery-zone** (10 fields) - Delivery zones
- **store-delivery-zone** (8 fields) - Store delivery zones
- **address** (15 fields) - User addresses

### 6. System
- **notification** (12 fields) - User notifications
- **notification-template** (10 fields) - Notification templates
- **notification-preference** (8 fields) - User preferences
- **otp** (8 fields) - One-time passwords
- **audit-log** (15 fields) - System audit logs
- **user-activity** (10 fields) - User activity tracking
- **device-token** (8 fields) - Push notification tokens

## Indexes Strategy

### High-Priority Indexes (Performance Critical)
1. **order.customerId + orderStatus + createdAt** - Customer order history
2. **product.storeId + status** - Store products
3. **notification.recipientId + isRead + createdAt** - User notifications
4. **payment.storeId + status + createdAt** - Store payments
5. **wallet-transaction.walletId + createdAt** - Wallet history

### Geospatial Indexes
1. **address.location** (2dsphere) - Location-based queries
2. **order.deliveryAddress.location** (2dsphere) - Delivery routing

### Text Search Indexes
1. **product.name + description + tags** - Product search
2. **store-category.name + description** - Category search

### TTL Indexes (Auto-cleanup)
1. **otp.expiresAt** (300 seconds) - OTP cleanup
2. **audit-log.createdAt** (1 year) - Log retention
3. **notification.createdAt** (90 days) - Notification cleanup
4. **user-activity.createdAt** (180 days) - Activity cleanup
```

---

#### **6.3 Runbook Creation (1 يوم)**

**المهام:**
- [ ] إنشاء Runbook للعمليات اليومية
- [ ] توثيق Common Issues
- [ ] توثيق Emergency Procedures
- [ ] توثيق Escalation Process

**RUNBOOK.md:**
```markdown
# Daraa Platform Runbook

## Daily Operations

### 1. Health Checks (Every Morning)
```bash
# Check MongoDB status
docker exec daraa-mongodb-primary mongosh --eval "rs.status()"

# Check Redis status
docker exec daraa-redis-master redis-cli ping

# Check application logs
docker logs daraa-server-1 --tail 100

# Check Grafana dashboards
open http://localhost:3000
```

### 2. Backup Verification (Daily)
```bash
# Check last backup
ls -lh /backups/mongodb/ | tail -5

# Verify backup integrity
mongorestore --uri="mongodb://localhost:27017/daraa_test" \
  --dir="/backups/mongodb/$(date +%Y%m%d)_*" \
  --dryRun
```

### 3. Performance Monitoring (Hourly)
```bash
# Check slow queries
docker exec daraa-mongodb-primary mongosh daraa --eval "
  db.setProfilingLevel(1, { slowms: 100 });
  db.system.profile.find().sort({ ts: -1 }).limit(5).pretty();
"

# Check connection pool
docker exec daraa-mongodb-primary mongosh --eval "
  db.serverStatus().connections
"
```

## Common Issues

### Issue 1: High CPU Usage
**Symptoms:** CPU > 80%, slow response times

**Diagnosis:**
```bash
# Check running queries
docker exec daraa-mongodb-primary mongosh --eval "db.currentOp()"

# Check slow queries
docker exec daraa-mongodb-primary mongosh daraa --eval "
  db.system.profile.find({ millis: { \$gt: 1000 } }).sort({ ts: -1 }).limit(10)
"
```

**Resolution:**
1. Kill long-running queries: `db.killOp(opid)`
2. Add missing indexes
3. Optimize query patterns
4. Scale horizontally if needed

### Issue 2: MongoDB Replica Set Failover
**Symptoms:** Primary node down, application errors

**Diagnosis:**
```bash
# Check replica set status
docker exec daraa-mongodb-secondary mongosh --eval "rs.status()"
```

**Resolution:**
1. Check if secondary promoted to primary (automatic)
2. Investigate primary node failure
3. Restart failed node
4. Re-add to replica set if needed

### Issue 3: Disk Space Full
**Symptoms:** Write errors, backup failures

**Diagnosis:**
```bash
# Check disk usage
df -h
du -sh /var/lib/docker/volumes/*
```

**Resolution:**
1. Delete old backups: `find /backups -mtime +30 -delete`
2. Archive old data
3. Compact database: `db.runCommand({ compact: 'collection' })`
4. Add more disk space

## Emergency Procedures

### Emergency 1: Complete System Failure
1. Check all containers: `docker ps -a`
2. Check logs: `docker logs <container>`
3. Restart services: `docker-compose restart`
4. If data corruption: Restore from backup
5. Escalate to senior engineer

### Emergency 2: Data Breach Detected
1. Immediately isolate affected systems
2. Change all passwords and secrets
3. Review audit logs
4. Notify security team
5. Follow incident response plan

### Emergency 3: Performance Degradation
1. Check monitoring dashboards
2. Identify bottleneck (CPU/Memory/Disk/Network)
3. Scale affected component
4. Optimize queries if database issue
5. Add caching if needed
```

---

## 📊 **ملخص التحسينات**

### **قبل التحسينات:**
| المجال | التقييم |
|--------|---------|
| Schema Design | 8/10 |
| Indexes | 6/10 |
| Docker Setup | 5/10 |
| Security | 3/10 |
| Performance | 5/10 |
| Scalability | 4/10 |
| **المجموع** | **5.3/10** ⚠️ |

### **بعد التحسينات:**
| المجال | التقييم |
|--------|---------|
| Schema Design | 9/10 ✅ |
| Indexes | 9/10 ✅ |
| Docker Setup | 9/10 ✅ |
| Security | 9/10 ✅ |
| Performance | 9/10 ✅ |
| Scalability | 9/10 ✅ |
| **المجموع** | **9.0/10** 🎉 |

---

## 💰 **التكلفة والموارد**

### **Infrastructure Costs (شهرياً):**
- **MongoDB Replica Set (3 nodes):** $150-300
- **Redis Cluster (3 nodes):** $50-100
- **Application Servers (2 instances):** $100-200
- **Load Balancer:** $20-50
- **Monitoring Stack:** $30-60
- **Backup Storage (S3):** $20-50
- **Total:** **$370-760/month**

### **Development Time:**
- **Phase 1 (Security):** 7 أيام
- **Phase 2 (Performance):** 6 أيام
- **Phase 3 (High Availability):** 7 أيام
- **Phase 4 (Monitoring):** 7 أيام
- **Phase 5 (Data Management):** 5 أيام
- **Phase 6 (Testing & Docs):** 5 أيام
- **Total:** **37 يوم عمل (5-6 أسابيع)**

### **Team Requirements:**
- **Backend Developer:** 1 شخص (full-time)
- **DevOps Engineer:** 1 شخص (part-time)
- **DBA (Database Admin):** 1 شخص (consultant)

---

## 🎯 **الأولويات**

### **🔴 Critical (يجب البدء فوراً):**
1. ✅ إضافة MongoDB Authentication
2. ✅ إنشاء Backup Strategy
3. ✅ إضافة Resource Limits
4. ✅ Secrets Management

**المدة:** أسبوع واحد
**التأثير:** حماية من فقدان البيانات والاختراقات

### **🟡 High Priority (خلال أسبوعين):**
1. ✅ Connection Pooling Optimization
2. ✅ Indexes Optimization
3. ✅ Caching Strategy
4. ✅ MongoDB Replica Set

**المدة:** أسبوعين
**التأثير:** تحسين الأداء بنسبة 300-500%

### **🟢 Medium Priority (خلال شهر):**
1. ✅ Monitoring Stack
2. ✅ Logging Stack
3. ✅ Load Balancer
4. ✅ Data Archiving

**المدة:** أسبوعين
**التأثير:** استقرار النظام وقابلية التوسع

---

## 📈 **النتائج المتوقعة**

### **Performance Improvements:**
- ⚡ **Response Time:** تحسن بنسبة 70% (من ~500ms إلى ~150ms)
- ⚡ **Throughput:** زيادة بنسبة 400% (من 100 req/s إلى 500 req/s)
- ⚡ **Database Queries:** تحسن بنسبة 80% (من ~200ms إلى ~40ms)
- ⚡ **Cache Hit Rate:** 85-90% للـ queries المتكررة

### **Reliability Improvements:**
- 🛡️ **Uptime:** من 95% إلى 99.9%
- 🛡️ **Data Loss Risk:** من High إلى Near Zero
- 🛡️ **Recovery Time:** من ساعات إلى دقائق
- 🛡️ **Failover Time:** أقل من 30 ثانية

### **Scalability Improvements:**
- 📈 **Concurrent Users:** من 1,000 إلى 10,000+
- 📈 **Database Size:** من 10GB إلى 1TB+
- 📈 **Horizontal Scaling:** جاهز للتوسع
- 📈 **Geographic Distribution:** جاهز للتوزيع الجغرافي

---

## ✅ **Checklist للتنفيذ**

### **Week 1-2: Security & Stability**
- [ ] إضافة MongoDB Authentication
- [ ] إنشاء MongoDB Users (app, backup, readonly)
- [ ] تفعيل TLS/SSL
- [ ] إنشاء Backup Script
- [ ] جدولة Daily Backups
- [ ] اختبار Restore Process
- [ ] إضافة Resource Limits
- [ ] Secrets Management
- [ ] تحديث Documentation

### **Week 2-3: Performance**
- [ ] إضافة Connection Pooling Settings
- [ ] تحليل Slow Queries
- [ ] إضافة Compound Indexes
- [ ] إضافة TTL Indexes
- [ ] إضافة Partial Indexes
- [ ] تطبيق Caching Strategy
- [ ] Cache Invalidation Logic
- [ ] Performance Testing

### **Week 3-4: High Availability**
- [ ] إنشاء MongoDB Replica Set
- [ ] تكوين Primary/Secondary/Arbiter
- [ ] اختبار Failover
- [ ] إضافة Redis Cluster
- [ ] تكوين Redis Sentinel
- [ ] إضافة Load Balancer (Nginx)
- [ ] تكوين Multiple Server Instances
- [ ] Health Checks

### **Week 4-5: Monitoring & Logging**
- [ ] إضافة Prometheus
- [ ] إضافة Grafana
- [ ] إنشاء Dashboards
- [ ] إضافة MongoDB Exporter
- [ ] إضافة Redis Exporter
- [ ] إضافة ELK Stack
- [ ] تكوين Log Aggregation
- [ ] إنشاء Alerts

### **Week 5-6: Data Management & Testing**
- [ ] إنشاء Archiving Strategy
- [ ] Data Cleanup Jobs
- [ ] Database Maintenance Scripts
- [ ] Load Testing
- [ ] Stress Testing
- [ ] Failover Testing
- [ ] Documentation
- [ ] Runbook Creation

---

## 🎓 **التوصيات النهائية**

### **1. ابدأ بالأساسيات:**
ركز على الأمان والـ Backup أولاً قبل أي شيء آخر. فقدان البيانات أو الاختراق أخطر من الأداء البطيء.

### **2. قياس الأداء:**
استخدم Monitoring من اليوم الأول لتتبع التحسينات وتحديد المشاكل مبكراً.

### **3. التوثيق:**
وثّق كل تغيير تقوم به. سيوفر عليك الكثير من الوقت في المستقبل.

### **4. الاختبار:**
اختبر كل تحسين في بيئة staging قبل production. لا تخاطر بالبيانات الحقيقية.

### **5. التدرج:**
لا تحاول تطبيق كل شيء دفعة واحدة. اتبع الأولويات وتقدم خطوة بخطوة.

### **6. المراجعة:**
راجع الأداء والأمان بشكل دوري (شهرياً على الأقل) وحدّث الخطة حسب الحاجة.

---

## 📞 **الدعم والمساعدة**

إذا واجهت أي مشاكل أثناء التنفيذ:
1. راجع الـ Documentation
2. تحقق من الـ Logs
3. استشر الـ Runbook
4. اطلب المساعدة من الفريق

**Good Luck! 🚀**

