export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'critical';
export type AnomalyType = 'spike' | 'pattern' | 'threshold' | 'drift' | 'correlation';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type HealingStatus = 'pending' | 'in_progress' | 'applied' | 'failed' | 'rolled_back';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  isAnomaly: boolean;
  anomalyScore?: number;
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  description: string;
  detectedAt: Date;
  logIds: string[];
  score: number;
}

export interface Alert {
  id: string;
  anomalyId: string;
  status: AlertStatus;
  email: string;
  subject: string;
  sentAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface HealingAction {
  id: string;
  anomalyId: string;
  title: string;
  description: string;
  status: HealingStatus;
  prUrl?: string;
  diff: string;
  createdAt: Date;
  appliedAt?: Date;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  errorRate: number;
  latency: number;
  anomalyCount: number;
}
