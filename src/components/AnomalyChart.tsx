import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnomalyChartProps {
  data: Array<{
    time: string;
    errors: number;
    warnings: number;
    anomalyScore: number;
    throughput: number;
  }>;
}

export function AnomalyChart({ data }: AnomalyChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Anomaly Score Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} domain={[0, 1]} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: 'hsl(210, 20%, 90%)' }}
            />
            <Area type="monotone" dataKey="anomalyScore" stroke="hsl(0, 72%, 55%)" fill="url(#scoreGradient)" strokeWidth={2} name="Anomaly Score" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Errors & Warnings</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: 'hsl(210, 20%, 90%)' }}
            />
            <Bar dataKey="errors" fill="hsl(0, 72%, 55%)" radius={[2, 2, 0, 0]} name="Errors" />
            <Bar dataKey="warnings" fill="hsl(38, 92%, 55%)" radius={[2, 2, 0, 0]} name="Warnings" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
