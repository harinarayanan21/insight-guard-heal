import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Alert } from '@/types/log-types';

interface SeverityPieChartProps {
  alerts: Alert[];
}

export function SeverityPieChart({ alerts }: SeverityPieChartProps) {
  const severityCounts = alerts.reduce((acc, alert) => {
    const sev = alert.subject.includes('CRITICAL') ? 'Critical' :
                alert.subject.includes('HIGH') ? 'High' :
                alert.subject.includes('MEDIUM') ? 'Medium' : 'Low';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: 'Critical', value: severityCounts['Critical'] || 0, color: 'hsl(0, 72%, 55%)' },
    { name: 'High', value: severityCounts['High'] || 0, color: 'hsl(38, 92%, 55%)' },
    { name: 'Medium', value: severityCounts['Medium'] || 0, color: 'hsl(210, 90%, 55%)' },
    { name: 'Low', value: severityCounts['Low'] || 0, color: 'hsl(142, 72%, 50%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col">
      <h3 className="text-sm font-semibold text-foreground mb-2">Alert Severity</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">No alerts yet</div>
      ) : (
        <div className="flex-1 flex items-center">
          <ResponsiveContainer width="50%" height={100}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={25} outerRadius={42} paddingAngle={3} dataKey="value">
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {data.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-muted-foreground">{d.name}</span>
                <span className="text-[11px] font-bold text-foreground font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
