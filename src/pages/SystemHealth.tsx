import { useLogStream } from '@/hooks/use-log-stream';
import { ServiceHealthGrid } from '@/components/ServiceHealthGrid';
import { HealthScoreGauge } from '@/components/HealthScoreGauge';
import { Activity, Cpu, HardDrive, Gauge, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const SystemHealth = () => {
  const { serviceHealth } = useLogStream();

  const healthScore = Math.round(
    (serviceHealth.filter(s => s.status === 'healthy').length / Math.max(serviceHealth.length, 1)) * 100
  );

  const metrics = useMemo(() => [
    { label: 'CPU Usage', value: `${Math.round(30 + Math.random() * 40)}%`, icon: Cpu, color: 'text-neon-blue' },
    { label: 'Memory', value: `${Math.round(45 + Math.random() * 30)}%`, icon: HardDrive, color: 'text-neon-purple' },
    { label: 'Avg Latency', value: `${Math.round(serviceHealth.reduce((s, h) => s + h.latency, 0) / Math.max(serviceHealth.length, 1))}ms`, icon: Gauge, color: 'text-neon-amber' },
    { label: 'Uptime', value: '99.94%', icon: Clock, color: 'text-primary' },
  ], [serviceHealth]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-lg p-4 flex items-center gap-3"
          >
            <m.icon className={`w-5 h-5 ${m.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HealthScoreGauge score={healthScore} servicesUp={serviceHealth.filter(s => s.status === 'healthy').length} total={serviceHealth.length} />
        <div className="lg:col-span-2">
          <ServiceHealthGrid services={serviceHealth} />
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
