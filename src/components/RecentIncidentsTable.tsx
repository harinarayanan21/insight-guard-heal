import { Alert } from '@/types/log-types';
import { Clock, AlertTriangle, Check, Eye } from 'lucide-react';

interface RecentIncidentsTableProps {
  alerts: Alert[];
}

const statusIcons = {
  active: AlertTriangle,
  acknowledged: Eye,
  resolved: Check,
};

const statusColors = {
  active: 'text-destructive',
  acknowledged: 'text-neon-amber',
  resolved: 'text-primary',
};

export function RecentIncidentsTable({ alerts }: RecentIncidentsTableProps) {
  const recent = alerts.slice(0, 8);

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-[300px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Recent Incidents</span>
      </div>
      <div className="flex-1 overflow-y-auto terminal-scroll">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Incident</th>
              <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(alert => {
              const Icon = statusIcons[alert.status];
              return (
                <tr key={alert.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <Icon className={`w-3.5 h-3.5 ${statusColors[alert.status]}`} />
                  </td>
                  <td className="px-4 py-2.5 text-foreground truncate max-w-[200px]">{alert.subject}</td>
                  <td className="px-4 py-2.5 text-muted-foreground font-mono hidden md:table-cell">
                    {alert.sentAt.toLocaleTimeString()}
                  </td>
                </tr>
              );
            })}
            {recent.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No incidents yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
