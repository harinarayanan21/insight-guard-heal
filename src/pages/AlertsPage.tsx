import { useLogStream } from '@/hooks/use-log-stream';
import { AlertPanel } from '@/components/AlertPanel';
import { AlertSettings } from '@/components/AlertSettings';
import { Bell, Check, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertsPage = () => {
  const {
    alerts, acknowledgeAlert, resolveAlert,
    alertEmail, setAlertEmail, emailEnabled, setEmailEnabled, minSeverity, setMinSeverity,
  } = useLogStream();

  const active = alerts.filter(a => a.status === 'active').length;
  const acked = alerts.filter(a => a.status === 'acknowledged').length;
  const resolved = alerts.filter(a => a.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {[
            { label: 'Active', value: active, color: 'text-destructive', bg: 'bg-destructive/10' },
            { label: 'Acknowledged', value: acked, color: 'text-neon-amber', bg: 'bg-neon-amber/10' },
            { label: 'Resolved', value: resolved, color: 'text-primary', bg: 'bg-primary/10' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border border-border rounded-lg px-4 py-2 text-center`}>
              <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <AlertSettings
          email={alertEmail}
          onEmailChange={setAlertEmail}
          emailEnabled={emailEnabled}
          onToggleEmail={setEmailEnabled}
          minSeverity={minSeverity}
          onMinSeverityChange={setMinSeverity}
        />
      </div>

      {emailEnabled && alertEmail && (
        <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-primary font-medium">Email alerts active</span>
          <span className="text-muted-foreground">→ {alertEmail} (min: {minSeverity}+)</span>
        </div>
      )}

      <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} onResolve={resolveAlert} />
    </div>
  );
};

export default AlertsPage;
