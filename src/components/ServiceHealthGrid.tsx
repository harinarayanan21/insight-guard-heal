import { ServiceHealth } from '@/types/log-types';
import { motion } from 'framer-motion';

interface ServiceHealthGridProps {
  services: ServiceHealth[];
}

const statusColors = {
  healthy: 'bg-neon-green/10 border-neon-green/30 text-neon-green',
  degraded: 'bg-neon-amber/10 border-neon-amber/30 text-neon-amber',
  down: 'bg-neon-red/10 border-neon-red/30 text-neon-red',
};

const dotColors = {
  healthy: 'bg-neon-green',
  degraded: 'bg-neon-amber',
  down: 'bg-neon-red',
};

export function ServiceHealthGrid({ services }: ServiceHealthGridProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Service Health</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {services.map((service, i) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-lg border p-3 ${statusColors[service.status]}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${dotColors[service.status]} ${service.status !== 'healthy' ? 'animate-pulse-glow' : ''}`} />
              <span className="text-xs font-mono font-semibold truncate">{service.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
              <div>
                <span className="text-muted-foreground">err:</span>{' '}
                <span>{service.errorRate.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">lat:</span>{' '}
                <span>{service.latency.toFixed(0)}ms</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
