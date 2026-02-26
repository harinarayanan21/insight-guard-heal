import { Activity, Shield, Bell, GitPullRequest, Server, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsBarProps {
  stats: {
    totalLogs: number;
    anomaliesDetected: number;
    alertsSent: number;
    healingsApplied: number;
  };
  activeAlerts: number;
  servicesDown: number;
}

export function StatsBar({ stats, activeAlerts, servicesDown }: StatsBarProps) {
  const items = [
    { icon: Activity, label: 'Logs Processed', value: stats.totalLogs.toLocaleString(), color: 'text-neon-green' },
    { icon: AlertTriangle, label: 'Anomalies', value: stats.anomaliesDetected.toString(), color: 'text-neon-amber' },
    { icon: Bell, label: 'Active Alerts', value: activeAlerts.toString(), color: activeAlerts > 0 ? 'text-neon-red' : 'text-neon-green' },
    { icon: GitPullRequest, label: 'Healings Applied', value: stats.healingsApplied.toString(), color: 'text-neon-blue' },
    { icon: Server, label: 'Services Down', value: servicesDown.toString(), color: servicesDown > 0 ? 'text-neon-red' : 'text-neon-green' },
    { icon: Shield, label: 'System Health', value: servicesDown === 0 ? 'Healthy' : 'Degraded', color: servicesDown === 0 ? 'text-neon-green' : 'text-neon-amber' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
        >
          <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{item.label}</p>
            <p className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
