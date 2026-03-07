import { useLogStream } from '@/hooks/use-log-stream';
import { AnomalyChart } from '@/components/AnomalyChart';
import { SeverityPieChart } from '@/components/SeverityPieChart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Brain } from 'lucide-react';
import { useMemo } from 'react';

const AnalyticsPage = () => {
  const { anomalies, alerts, timeSeriesData, logs } = useLogStream();

  const errorFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.filter(l => l.level === 'error' || l.level === 'critical').forEach(l => {
      counts[l.service] = (counts[l.service] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [logs]);

  return (
    <div className="space-y-6">
      <AnomalyChart data={timeSeriesData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SeverityPieChart alerts={alerts} />

        {/* Error frequency by service */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-destructive" /> Top Error Sources
          </h3>
          <div className="space-y-2">
            {errorFrequency.slice(0, 6).map(item => {
              const max = errorFrequency[0]?.value || 1;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-xs text-foreground font-mono w-32 truncate">{item.name}</span>
                  <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-destructive/60 rounded-full" style={{ width: `${(item.value / max) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-8 text-right">{item.value}</span>
                </div>
              );
            })}
            {errorFrequency.length === 0 && <p className="text-xs text-muted-foreground">No errors yet</p>}
          </div>
        </div>
      </div>

      {/* Throughput */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> System Throughput
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timeSeriesData}>
            <defs>
              <linearGradient id="tpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="throughput" stroke="hsl(142, 72%, 50%)" fill="url(#tpGradient)" strokeWidth={2} name="req/s" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
