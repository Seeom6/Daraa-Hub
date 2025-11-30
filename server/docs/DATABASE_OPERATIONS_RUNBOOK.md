# Database Operations Runbook

## Quick Reference

### Starting Services

```bash
# Development (single MongoDB)
docker-compose up -d

# Production with HA
docker-compose -f docker-compose.yml -f docker-compose.ha.yml up -d

# With Monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Health Checks

```bash
# Application health
curl http://localhost:3001/api/health

# Database health
curl http://localhost:3001/api/health/db

# Redis health
curl http://localhost:3001/api/health/redis

# Prometheus metrics
curl http://localhost:3001/api/health/metrics
```

---

## MongoDB Operations

### Backup

```bash
# Manual backup
./scripts/backup-mongodb.sh

# Verify backup
ls -la backups/mongodb/
```

### Restore

```bash
# Restore from backup
docker exec -i daraa-mongodb mongorestore \
  -u admin -p $MONGO_ROOT_PASSWORD \
  --authenticationDatabase admin \
  --archive < backups/mongodb/daraa_backup_YYYYMMDD_HHMMSS.archive
```

### Replica Set Status

```bash
# Check replica set status
docker exec daraa-mongodb-primary mongosh \
  -u admin -p $MONGO_ROOT_PASSWORD \
  --authenticationDatabase admin \
  --eval "rs.status()"

# Check replication lag
docker exec daraa-mongodb-primary mongosh \
  -u admin -p $MONGO_ROOT_PASSWORD \
  --authenticationDatabase admin \
  --eval "rs.printSecondaryReplicationInfo()"
```

---

## Redis Operations

### Health Check

```bash
# Redis ping
docker exec daraa-redis redis-cli -a $REDIS_PASSWORD ping

# Memory usage
docker exec daraa-redis redis-cli -a $REDIS_PASSWORD info memory
```

### Cache Management

```bash
# Clear all cache
docker exec daraa-redis redis-cli -a $REDIS_PASSWORD FLUSHALL

# Clear specific pattern
docker exec daraa-redis redis-cli -a $REDIS_PASSWORD --scan --pattern "cache:*" | xargs -L 1 redis-cli DEL
```

---

## Monitoring

### Prometheus

- URL: http://localhost:9090
- Targets: http://localhost:9090/targets
- Alerts: http://localhost:9090/alerts

### Grafana

- URL: http://localhost:3000
- Default credentials: admin / DaraaGrafana2024

---

## Troubleshooting

### High Memory Usage

1. Check MongoDB memory: `docker stats daraa-mongodb`
2. Check Redis memory: `docker exec daraa-redis redis-cli info memory`
3. Trigger cleanup: Call `/api/admin/cleanup` endpoint

### Slow Queries

1. Enable profiling: `db.setProfilingLevel(1, { slowms: 100 })`
2. Check slow queries: `db.system.profile.find().sort({ts:-1}).limit(10)`
3. Analyze with explain: `db.collection.find({...}).explain("executionStats")`

### Connection Issues

1. Check connection pool: `db.serverStatus().connections`
2. Check max connections: `db.serverStatus().connections.available`
3. Restart if needed: `docker-compose restart server`

---

## Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Data Cleanup | Daily 3 AM | Cleans old notifications, abandoned carts |
| Weekly Archive | Sunday 2 AM | Archives old audit logs |
| DB Maintenance | Sunday 4 AM | Collects stats, validates indexes |

---

## Emergency Contacts

- Database Admin: [Add contact]
- DevOps: [Add contact]
- On-call: [Add contact]

