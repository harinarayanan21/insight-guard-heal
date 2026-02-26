import { LogEntry, Anomaly, Alert, HealingAction, ServiceHealth, LogLevel } from '@/types/log-types';

const services = ['api-gateway', 'auth-service', 'payment-engine', 'user-service', 'notification-hub', 'data-pipeline'];
const levels: LogLevel[] = ['info', 'warn', 'error', 'debug', 'critical'];

const normalMessages: Record<string, string[]> = {
  'api-gateway': [
    'Request processed successfully GET /api/v1/users',
    'Rate limiter: 234/1000 requests used',
    'Connection pool: 45/100 active connections',
    'TLS handshake completed in 12ms',
  ],
  'auth-service': [
    'User login successful uid=usr_8a2f',
    'JWT token refreshed for session sid_4e1c',
    'OAuth callback processed provider=google',
    'Session cleanup: removed 12 expired sessions',
  ],
  'payment-engine': [
    'Payment processed txn_id=txn_9f3a amount=49.99',
    'Webhook received from stripe event=charge.succeeded',
    'Invoice generated inv_2b4e for customer cust_7d1a',
    'Reconciliation batch completed: 156 transactions',
  ],
  'user-service': [
    'Profile updated for user usr_3c5d',
    'Avatar upload completed size=2.4MB',
    'Preferences synced across 3 devices',
    'Cache hit ratio: 94.2%',
  ],
  'notification-hub': [
    'Email queued for delivery to 45 recipients',
    'Push notification sent to device dev_8e2f',
    'SMS delivery confirmed sid=sms_1a3b',
    'Batch notification processed: 230 messages',
  ],
  'data-pipeline': [
    'ETL job completed: 45,230 records processed',
    'Kafka consumer lag: 12 messages',
    'Data validation passed: schema v2.3',
    'Checkpoint saved at offset 892341',
  ],
};

const anomalyMessages: Record<string, string[]> = {
  'api-gateway': [
    'ERROR: Connection pool exhausted - 100/100 connections in use',
    'CRITICAL: Response time spike detected avg=4532ms (threshold: 200ms)',
    'ERROR: Circuit breaker OPEN for downstream service payment-engine',
    'WARN: Unusual traffic pattern: 5x normal request rate from IP 192.168.1.0/24',
  ],
  'auth-service': [
    'CRITICAL: 847 failed login attempts from single IP in 60s',
    'ERROR: JWT signing key rotation failed - using expired key',
    'WARN: Brute force pattern detected targeting admin accounts',
    'ERROR: OAuth state mismatch - possible CSRF attack',
  ],
  'payment-engine': [
    'CRITICAL: Payment gateway timeout after 30000ms - 23 transactions pending',
    'ERROR: Duplicate charge detected txn_id=txn_9f3a amount=49.99',
    'ERROR: Database connection pool leak detected - growing unbounded',
    'CRITICAL: Reconciliation mismatch: $12,340.50 discrepancy',
  ],
  'user-service': [
    'ERROR: Memory usage at 94% - OOM kill imminent',
    'CRITICAL: Database replica lag exceeding 30s',
    'ERROR: Cascading failure in user profile resolution',
    'WARN: Cache invalidation storm - 10k evictions/sec',
  ],
  'notification-hub': [
    'ERROR: Email delivery failure rate at 34% (threshold: 5%)',
    'CRITICAL: Message queue depth at 50,000 - consumer stalled',
    'ERROR: Rate limit exceeded for SMS provider',
    'WARN: Notification deduplication failing - duplicate sends detected',
  ],
  'data-pipeline': [
    'CRITICAL: ETL job failed - schema validation error on 12,000 records',
    'ERROR: Kafka consumer group rebalancing loop detected',
    'ERROR: Data corruption detected in partition 7',
    'CRITICAL: Pipeline backpressure - 500k records queued',
  ],
};

let logIdCounter = 0;

export function generateLogEntry(forceAnomaly = false): LogEntry {
  const service = services[Math.floor(Math.random() * services.length)];
  const isAnomaly = forceAnomaly || Math.random() < 0.08;
  const messages = isAnomaly ? anomalyMessages[service] : normalMessages[service];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  let level: LogLevel;
  if (isAnomaly) {
    const r = Math.random();
    level = r < 0.3 ? 'critical' : r < 0.6 ? 'error' : 'warn';
  } else {
    const r = Math.random();
    level = r < 0.5 ? 'info' : r < 0.8 ? 'debug' : 'warn';
  }

  logIdCounter++;
  return {
    id: `log_${logIdCounter.toString().padStart(6, '0')}`,
    timestamp: new Date(),
    level,
    service,
    message,
    isAnomaly,
    anomalyScore: isAnomaly ? 0.6 + Math.random() * 0.4 : Math.random() * 0.3,
  };
}

let anomalyIdCounter = 0;

export function generateAnomaly(logs: LogEntry[]): Anomaly {
  const anomalyLogs = logs.filter(l => l.isAnomaly);
  const service = anomalyLogs.length > 0 
    ? anomalyLogs[anomalyLogs.length - 1].service 
    : services[Math.floor(Math.random() * services.length)];
  
  const types: Array<Anomaly['type']> = ['spike', 'pattern', 'threshold', 'drift', 'correlation'];
  const severities: Array<Anomaly['severity']> = ['low', 'medium', 'high', 'critical'];
  
  anomalyIdCounter++;
  return {
    id: `anomaly_${anomalyIdCounter.toString().padStart(4, '0')}`,
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    service,
    description: anomalyLogs.length > 0 
      ? anomalyLogs[anomalyLogs.length - 1].message 
      : 'Anomalous pattern detected in service metrics',
    detectedAt: new Date(),
    logIds: anomalyLogs.slice(-3).map(l => l.id),
    score: 0.7 + Math.random() * 0.3,
  };
}

const healingTemplates: Array<{ title: string; description: string; diff: string }> = [
  {
    title: 'Scale up connection pool',
    description: 'Increase max connections from 100 to 250 to handle traffic spike',
    diff: `--- config/database.yml\n+++ config/database.yml\n@@ -12,7 +12,7 @@\n production:\n   adapter: postgresql\n-  pool: 100\n+  pool: 250\n   timeout: 5000`,
  },
  {
    title: 'Enable circuit breaker fallback',
    description: 'Add graceful degradation when downstream services are unavailable',
    diff: `--- src/services/gateway.ts\n+++ src/services/gateway.ts\n@@ -45,6 +45,12 @@\n   circuitBreaker: {\n     enabled: true,\n-    threshold: 5,\n+    threshold: 3,\n+    fallback: async () => ({\n+      status: 'degraded',\n+      cached: true,\n+      data: await cache.get(key)\n+    }),\n     timeout: 30000,\n   }`,
  },
  {
    title: 'Add rate limiting per IP',
    description: 'Implement IP-based rate limiting to prevent brute force attacks',
    diff: `--- src/middleware/rateLimit.ts\n+++ src/middleware/rateLimit.ts\n@@ -1,5 +1,15 @@\n+import { RateLimiter } from '@/lib/rate-limiter';\n+\n+const limiter = new RateLimiter({\n+  windowMs: 60 * 1000,\n+  maxRequests: 100,\n+  blockDuration: 15 * 60 * 1000,\n+  keyGenerator: (req) => req.ip,\n+});\n+\n export const rateLimitMiddleware = (req, res, next) => {\n-  // TODO: implement rate limiting\n-  next();\n+  if (limiter.isBlocked(req.ip)) {\n+    return res.status(429).json({ error: 'Too many requests' });\n+  }\n+  limiter.hit(req.ip);\n+  next();\n };`,
  },
  {
    title: 'Increase memory limits',
    description: 'Bump container memory from 512MB to 1GB to prevent OOM kills',
    diff: `--- k8s/deployment.yaml\n+++ k8s/deployment.yaml\n@@ -28,8 +28,8 @@\n         resources:\n           limits:\n-            memory: "512Mi"\n-            cpu: "500m"\n+            memory: "1Gi"\n+            cpu: "1000m"\n           requests:\n-            memory: "256Mi"\n+            memory: "512Mi"`,
  },
  {
    title: 'Fix consumer group rebalancing',
    description: 'Increase session timeout and reduce heartbeat interval',
    diff: `--- config/kafka-consumer.json\n+++ config/kafka-consumer.json\n@@ -5,8 +5,9 @@\n   "consumer": {\n-    "session.timeout.ms": 10000,\n-    "heartbeat.interval.ms": 3000,\n+    "session.timeout.ms": 30000,\n+    "heartbeat.interval.ms": 5000,\n+    "max.poll.interval.ms": 600000,\n+    "partition.assignment.strategy": "cooperative-sticky",\n     "auto.offset.reset": "earliest"\n   }`,
  },
];

export function generateHealingAction(anomalyId: string): HealingAction {
  const template = healingTemplates[Math.floor(Math.random() * healingTemplates.length)];
  return {
    id: `heal_${Date.now()}`,
    anomalyId,
    title: template.title,
    description: template.description,
    status: 'pending',
    diff: template.diff,
    createdAt: new Date(),
    prUrl: `https://github.com/org/repo/pull/${100 + Math.floor(Math.random() * 900)}`,
  };
}

export function generateServiceHealth(): ServiceHealth[] {
  return services.map(name => {
    const r = Math.random();
    const status = r < 0.6 ? 'healthy' : r < 0.85 ? 'degraded' : 'down';
    return {
      name,
      status,
      errorRate: status === 'healthy' ? Math.random() * 2 : status === 'degraded' ? 2 + Math.random() * 8 : 10 + Math.random() * 30,
      latency: status === 'healthy' ? 20 + Math.random() * 80 : status === 'degraded' ? 200 + Math.random() * 500 : 1000 + Math.random() * 4000,
      anomalyCount: status === 'healthy' ? 0 : Math.floor(Math.random() * 10) + 1,
    };
  });
}

export function generateTimeSeriesData(points = 60) {
  const data = [];
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * 60000);
    const baseErrors = 5 + Math.sin(i / 10) * 3;
    const spike = Math.random() < 0.1 ? 20 + Math.random() * 30 : 0;
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      errors: Math.max(0, Math.round(baseErrors + spike + (Math.random() - 0.5) * 4)),
      warnings: Math.round(10 + Math.random() * 8),
      anomalyScore: Math.min(1, Math.max(0, 0.2 + Math.sin(i / 8) * 0.15 + (spike > 0 ? 0.4 : 0) + (Math.random() - 0.5) * 0.1)),
      throughput: Math.round(1000 + Math.sin(i / 15) * 300 + (Math.random() - 0.5) * 100),
    });
  }
  return data;
}
