import { Bell, Search, User, Zap } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/logs': 'Logs Monitor',
  '/anomalies': 'Anomaly Detection',
  '/alerts': 'Alerts & Notifications',
  '/healing': 'Healing Engine',
  '/analytics': 'Analytics',
  '/health': 'System Health',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/settings': 'Settings',
};

export function TopBar() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Insight Guard Heal';

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <h2 className="text-sm font-semibold text-foreground">{title}</h2>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-muted-foreground text-xs w-64">
        <Search className="w-3.5 h-3.5" />
        <span>Search logs, alerts, services...</span>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] text-muted-foreground font-mono">LIVE</span>
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[9px] text-destructive-foreground flex items-center justify-center font-bold">3</span>
      </button>

      {/* Profile */}
      <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors">
        <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-medium text-foreground leading-none">Admin</p>
          <p className="text-[10px] text-muted-foreground">Operator</p>
        </div>
      </button>
    </header>
  );
}
