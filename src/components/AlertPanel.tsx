import { Alert } from '@/types/log-types';
import { Bell, Check, Eye, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const statusStyles = {
  active: 'border-neon-red/30 bg-neon-red/5',
  acknowledged: 'border-neon-amber/30 bg-neon-amber/5',
  resolved: 'border-neon-green/30 bg-neon-green/5',
};

export function AlertPanel({ alerts, onAcknowledge, onResolve }: AlertPanelProps) {
  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-[350px]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <Bell className="w-4 h-4 text-neon-amber" />
        <span className="text-sm font-semibold text-foreground">Alerts</span>
        <span className="ml-auto text-xs bg-neon-red/20 text-neon-red px-2 py-0.5 rounded-full font-mono">
          {alerts.filter(a => a.status === 'active').length} active
        </span>
      </div>
      <div className="flex-1 overflow-y-auto terminal-scroll p-2 space-y-2">
        <AnimatePresence>
          {alerts.slice(0, 20).map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`rounded-md border p-3 ${statusStyles[alert.status]}`}
            >
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{alert.subject}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    To: {alert.email} • {alert.sentAt.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="p-1 rounded bg-secondary hover:bg-neon-amber/20 text-muted-foreground hover:text-neon-amber transition-colors"
                      title="Acknowledge"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="p-1 rounded bg-secondary hover:bg-neon-green/20 text-muted-foreground hover:text-neon-green transition-colors"
                      title="Resolve"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {alerts.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No alerts yet
          </div>
        )}
      </div>
    </div>
  );
}
