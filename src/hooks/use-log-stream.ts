import { useState, useEffect, useCallback, useRef } from 'react';
import { LogEntry, Anomaly, Alert, HealingAction, ServiceHealth } from '@/types/log-types';
import { generateLogEntry, generateAnomaly, generateHealingAction, generateServiceHealth, generateTimeSeriesData } from '@/lib/mock-data';

export function useLogStream(enabled = true) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [healingActions, setHealingActions] = useState<HealingAction[]>([]);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>(generateServiceHealth());
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [stats, setStats] = useState({ totalLogs: 0, anomaliesDetected: 0, alertsSent: 0, healingsApplied: 0 });
  const anomalyBuffer = useRef<LogEntry[]>([]);

  const addLog = useCallback(() => {
    const entry = generateLogEntry();
    setLogs(prev => {
      const next = [entry, ...prev].slice(0, 200);
      return next;
    });
    setStats(prev => ({ ...prev, totalLogs: prev.totalLogs + 1 }));

    if (entry.isAnomaly) {
      anomalyBuffer.current.push(entry);
      if (anomalyBuffer.current.length >= 2 || Math.random() < 0.5) {
        const anomaly = generateAnomaly(anomalyBuffer.current);
        setAnomalies(prev => [anomaly, ...prev].slice(0, 50));
        setStats(prev => ({ ...prev, anomaliesDetected: prev.anomaliesDetected + 1 }));
        anomalyBuffer.current = [];

        // Generate alert
        const alert: Alert = {
          id: `alert_${Date.now()}`,
          anomalyId: anomaly.id,
          status: 'active',
          email: 'admin@company.com',
          subject: `[${anomaly.severity.toUpperCase()}] Anomaly in ${anomaly.service}: ${anomaly.type}`,
          sentAt: new Date(),
        };
        setAlerts(prev => [alert, ...prev].slice(0, 50));
        setStats(prev => ({ ...prev, alertsSent: prev.alertsSent + 1 }));

        // Generate healing action
        if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
          const healing = generateHealingAction(anomaly.id);
          setHealingActions(prev => [healing, ...prev].slice(0, 30));
        }
      }
    }
  }, []);

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

  return { logs, anomalies, alerts, healingActions, serviceHealth, timeSeriesData, stats, acknowledgeAlert, resolveAlert, applyHealing, rollbackHealing };
}
