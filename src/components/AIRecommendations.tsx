import { Anomaly, ServiceHealth } from '@/types/log-types';
import { Brain, Lightbulb, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface AIRecommendationsProps {
  anomalies: Anomaly[];
  serviceHealth: ServiceHealth[];
}

export function AIRecommendations({ anomalies, serviceHealth }: AIRecommendationsProps) {
  const recommendations = useMemo(() => {
    const recs: { icon: typeof Brain; text: string; severity: 'info' | 'warning' | 'critical' }[] = [];

    const degraded = serviceHealth.filter(s => s.status === 'degraded');
    const down = serviceHealth.filter(s => s.status === 'down');

    if (down.length > 0) {
      recs.push({
        icon: Brain,
        text: `${down.map(s => s.name).join(', ')} ${down.length > 1 ? 'are' : 'is'} down. Recommend immediate investigation and failover activation.`,
        severity: 'critical',
      });
    }

    if (degraded.length > 2) {
      recs.push({
        icon: TrendingUp,
        text: `${degraded.length} services degraded simultaneously. Pattern suggests potential cascading failure. Consider scaling resources.`,
        severity: 'warning',
      });
    }

    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    if (criticalAnomalies.length > 3) {
      recs.push({
        icon: Lightbulb,
        text: `${criticalAnomalies.length} critical anomalies detected. AI suggests enabling auto-healing for recurring patterns.`,
        severity: 'warning',
      });
    }

    if (recs.length === 0) {
      recs.push({
        icon: Brain,
        text: 'System operating within normal parameters. No immediate actions recommended.',
        severity: 'info',
      });
    }

    return recs.slice(0, 4);
  }, [anomalies, serviceHealth]);

  const severityColors = {
    info: 'border-primary/20 bg-primary/5',
    warning: 'border-neon-amber/20 bg-neon-amber/5',
    critical: 'border-destructive/20 bg-destructive/5',
  };

  const iconColors = {
    info: 'text-primary',
    warning: 'text-neon-amber',
    critical: 'text-destructive',
  };

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-[300px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Brain className="w-4 h-4 text-neon-purple" />
        <span className="text-sm font-semibold text-foreground">AI Recommendations</span>
      </div>
      <div className="flex-1 overflow-y-auto terminal-scroll p-3 space-y-2">
        {recommendations.map((rec, i) => (
          <div key={i} className={`rounded-lg border p-3 ${severityColors[rec.severity]}`}>
            <div className="flex items-start gap-2.5">
              <rec.icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColors[rec.severity]}`} />
              <p className="text-xs text-foreground leading-relaxed">{rec.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
