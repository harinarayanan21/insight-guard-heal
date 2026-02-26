import { useLogStream } from '@/hooks/use-log-stream';
import { StatsBar } from '@/components/StatsBar';
import { LogStream } from '@/components/LogStream';
import { AnomalyChart } from '@/components/AnomalyChart';
import { ServiceHealthGrid } from '@/components/ServiceHealthGrid';
import { AlertPanel } from '@/components/AlertPanel';
import { HealingPanel } from '@/components/HealingPanel';
import { Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const {
    logs, anomalies, alerts, healingActions, serviceHealth,
    timeSeriesData, stats, acknowledgeAlert, resolveAlert,
    applyHealing, rollbackHealing,
  } = useLogStream();

  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const servicesDown = serviceHealth.filter(s => s.status === 'down').length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center glow-green">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            LogSentinel
            <Zap className="w-4 h-4 text-neon-amber" />
          </h1>
          <p className="text-xs text-muted-foreground">Real-time Log Anomaly Detection & Self-Healing</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>
      </motion.div>

      <div className="space-y-4">
        {/* Stats */}
        <StatsBar stats={stats} activeAlerts={activeAlerts} servicesDown={servicesDown} />

        {/* Charts */}
        <AnomalyChart data={timeSeriesData} />

        {/* Service Health */}
        <ServiceHealthGrid services={serviceHealth} />

        {/* Log Stream */}
        <LogStream logs={logs} />

        {/* Alerts & Healing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} onResolve={resolveAlert} />
          <HealingPanel actions={healingActions} onApply={applyHealing} onRollback={rollbackHealing} />
        </div>
      </div>
    </div>
  );
};

export default Index;
