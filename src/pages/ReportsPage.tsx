import { FileText, Download, Calendar, BarChart } from 'lucide-react';

const reports = [
  { name: 'Daily System Report', description: 'Overview of system performance and incidents from today', type: 'daily', icon: Calendar },
  { name: 'Weekly Anomaly Report', description: 'Summary of all anomalies detected this week', type: 'weekly', icon: BarChart },
  { name: 'Incident Report', description: 'Detailed breakdown of all incidents and resolutions', type: 'incident', icon: FileText },
  { name: 'Security Audit Report', description: 'Security posture assessment and compliance status', type: 'security', icon: FileText },
];

const exportFormats = ['PDF', 'CSV', 'Excel'];

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(report => (
          <div key={report.type} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
                <report.icon className="w-5 h-5 text-neon-blue" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{report.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {exportFormats.map(fmt => (
                <button key={fmt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">
                  <Download className="w-3 h-3" /> {fmt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
