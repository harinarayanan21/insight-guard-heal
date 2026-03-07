import { useLogStream } from '@/hooks/use-log-stream';
import { AnomalyChart } from '@/components/AnomalyChart';
import { Brain, TrendingUp, AlertTriangle, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

const AnomalyDetection = () => {
  const { anomalies, timeSeriesData } = useLogStream();

  const typeCount = anomalies.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgScore = anomalies.length > 0
    ? (anomalies.reduce((s, a) => s + a.score, 0) / anomalies.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Anomalies', value: anomalies.length, icon: AlertTriangle, color: 'text-neon-amber' },
          { label: 'Avg Confidence', value: avgScore, icon: Brain, color: 'text-neon-purple' },
          { label: 'Patterns Found', value: typeCount['pattern'] || 0, icon: TrendingUp, color: 'text-neon-blue' },
          { label: 'Critical', value: anomalies.filter(a => a.severity === 'critical').length, icon: BarChart, color: 'text-destructive' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-lg p-4 flex items-center gap-3"
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <AnomalyChart data={timeSeriesData} />

      {/* Anomaly List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Brain className="w-4 h-4 text-neon-purple" />
          <span className="text-sm font-semibold text-foreground">Detected Anomalies</span>
        </div>
        <div className="overflow-y-auto max-h-[400px] terminal-scroll">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/30">
                <th className="text-left px-4 py-2 font-medium">Type</th>
                <th className="text-left px-4 py-2 font-medium">Severity</th>
                <th className="text-left px-4 py-2 font-medium">Service</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Description</th>
                <th className="text-right px-4 py-2 font-medium">Confidence</th>
                <th className="text-right px-4 py-2 font-medium hidden md:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.slice(0, 30).map(a => {
                const sevColor = a.severity === 'critical' ? 'text-destructive bg-destructive/10 border-destructive/20'
                  : a.severity === 'high' ? 'text-neon-amber bg-neon-amber/10 border-neon-amber/20'
                  : a.severity === 'medium' ? 'text-neon-blue bg-neon-blue/10 border-neon-blue/20'
                  : 'text-primary bg-primary/10 border-primary/20';
                return (
                  <tr key={a.id} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="px-4 py-2.5 font-mono capitalize">{a.type}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase border ${sevColor}`}>{a.severity}</span>
                    </td>
                    <td className="px-4 py-2.5 text-neon-blue">{a.service}</td>
                    <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[250px] hidden md:table-cell">{a.description}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-neon-purple">{(a.score * 100).toFixed(0)}%</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground font-mono hidden md:table-cell">{a.detectedAt.toLocaleTimeString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;
