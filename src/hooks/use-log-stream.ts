import { useState, useEffect, useCallback, useRef } from 'react';
import { LogEntry, Anomaly, Alert, HealingAction, ServiceHealth } from '@/types/log-types';
import { generateLogEntry, generateAnomaly, generateHealingAction, generateServiceHealth, generateTimeSeriesData } from '@/lib/mock-data';
import { sendAlertEmail } from '@/lib/alert-service';
import { toast } from 'sonner';

const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };

export function useLogStream(enabled = true) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [healingActions, setHealingActions] = useState<HealingAction[]>([]);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>(generateServiceHealth());
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [stats, setStats] = useState({ totalLogs: 0, anomaliesDetected: 0, alertsSent: 0, healingsApplied: 0 });
  const anomalyBuffer = useRef<LogEntry[]>([]);

  // Email settings
  const [alertEmail, setAlertEmail] = useState(() => localStorage.getItem('logsentinel_email') || '');
  const [emailEnabled, setEmailEnabled] = useState(() => localStorage.getItem('logsentinel_email_enabled') === 'true');
  const [minSeverity, setMinSeverity] = useState(() => localStorage.getItem('logsentinel_min_severity') || 'high');

  useEffect(() => { localStorage.setItem('logsentinel_email', alertEmail); }, [alertEmail]);
  useEffect(() => { localStorage.setItem('logsentinel_email_enabled', String(emailEnabled)); }, [emailEnabled]);
  useEffect(() => { localStorage.setItem('logsentinel_min_severity', minSeverity); }, [minSeverity]);

  const shouldSendEmail = useCallback((severity: string) => {
    if (!emailEnabled || !alertEmail) return false;
    return severityOrder[severity as keyof typeof severityOrder] >= severityOrder[minSeverity as keyof typeof severityOrder];
  }, [emailEnabled, alertEmail, minSeverity]);

  const addLog = useCallback(() => {
    const entry = generateLogEntry();
    setLogs(prev => [entry, ...prev].slice(0, 200));
    setStats(prev => ({ ...prev, totalLogs: prev.totalLogs + 1 }));

    if (entry.isAnomaly) {
      anomalyBuffer.current.push(entry);
      if (anomalyBuffer.current.length >= 2 || Math.random() < 0.5) {
        const anomaly = generateAnomaly(anomalyBuffer.current);
        setAnomalies(prev => [anomaly, ...prev].slice(0, 50));
        setStats(prev => ({ ...prev, anomaliesDetected: prev.anomaliesDetected + 1 }));
        anomalyBuffer.current = [];

        const alert: Alert = {
          id: `alert_${Date.now()}`,
          anomalyId: anomaly.id,
          status: 'active',
          email: alertEmail || 'not-configured',
          subject: `[${anomaly.severity.toUpperCase()}] Anomaly in ${anomaly.service}: ${anomaly.type}`,
          sentAt: new Date(),
        };
        setAlerts(prev => [alert, ...prev].slice(0, 50));
        setStats(prev => ({ ...prev, alertsSent: prev.alertsSent + 1 }));

        // Send real email
        if (shouldSendEmail(anomaly.severity)) {
          sendAlertEmail(anomaly, alertEmail).then(result => {
            if (result.success) {
              toast.success(`Alert email sent to ${alertEmail}`, { duration: 3000 });
            } else {
              toast.error(`Email failed: ${result.error}`, { duration: 5000 });
            }
          });
        }

        if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
          const healing = generateHealingAction(anomaly.id);
          setHealingActions(prev => [healing, ...prev].slice(0, 30));
        }
      }
    }
  }, [alertEmail, shouldSendEmail]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' as const, acknowledgedAt: new Date() } : a));
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' as const, resolvedAt: new Date() } : a));
  }, []);

  const applyHealing = useCallback((healingId: string) => {
    setHealingActions(prev => prev.map(h => h.id === healingId ? { ...h, status: 'in_progress' as const } : h));
    setTimeout(() => {
      setHealingActions(prev => prev.map(h => h.id === healingId ? { ...h, status: 'applied' as const, appliedAt: new Date() } : h));
      setStats(prev => ({ ...prev, healingsApplied: prev.healingsApplied + 1 }));
    }, 2000);
  }, []);

  const rollbackHealing = useCallback((healingId: string) => {
    setHealingActions(prev => prev.map(h => h.id === healingId ? { ...h, status: 'rolled_back' as const } : h));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(addLog, 800);
    const healthInterval = setInterval(() => setServiceHealth(generateServiceHealth()), 10000);
    const tsInterval = setInterval(() => {
      setTimeSeriesData(prev => {
        const now = new Date();
        const baseErrors = 5 + Math.sin(Date.now() / 600000) * 3;
        const spike = Math.random() < 0.1 ? 20 + Math.random() * 30 : 0;
        const newPoint = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          errors: Math.max(0, Math.round(baseErrors + spike + (Math.random() - 0.5) * 4)),
          warnings: Math.round(10 + Math.random() * 8),
          anomalyScore: Math.min(1, Math.max(0, 0.3 + (spike > 0 ? 0.4 : 0) + (Math.random() - 0.5) * 0.15)),
          throughput: Math.round(1000 + Math.sin(Date.now() / 900000) * 300 + (Math.random() - 0.5) * 100),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(healthInterval);
      clearInterval(tsInterval);
    };
  }, [enabled, addLog]);

  return {
    logs, anomalies, alerts, healingActions, serviceHealth, timeSeriesData, stats,
    acknowledgeAlert, resolveAlert, applyHealing, rollbackHealing,
    alertEmail, setAlertEmail, emailEnabled, setEmailEnabled, minSeverity, setMinSeverity,
  };
}
