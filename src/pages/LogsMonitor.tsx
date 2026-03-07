import { useLogStream } from '@/hooks/use-log-stream';
import { LogEntry } from '@/types/log-types';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Download, Pause, Play, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const levelBadgeColors: Record<string, string> = {
  info: 'bg-primary/10 text-primary border-primary/20',
  debug: 'bg-muted text-muted-foreground border-border',
  warn: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
};

const LogsMonitor = () => {
  const { logs } = useLogStream();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const services = useMemo(() => [...new Set(logs.map(l => l.service))], [logs]);

  const filtered = useMemo(() => {
    let result = logs;
    if (levelFilter !== 'all') result = result.filter(l => l.level === levelFilter);
    if (serviceFilter !== 'all') result = result.filter(l => l.service === serviceFilter);
    if (search) result = result.filter(l => l.message.toLowerCase().includes(search.toLowerCase()) || l.service.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [logs, levelFilter, serviceFilter, search]);

  useEffect(() => {
    if (!paused && containerRef.current) containerRef.current.scrollTop = 0;
  }, [logs, paused]);

  const exportLogs = () => {
    const csv = ['Timestamp,Level,Service,Message,Anomaly,Score']
      .concat(filtered.map(l =>
        `"${l.timestamp.toISOString()}","${l.level}","${l.service}","${l.message.replace(/"/g, '""')}",${l.isAnomaly},${l.anomalyScore?.toFixed(2) || ''}`
      )).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `logs-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground">
          <option value="all">All Levels</option>
          <option value="critical">Critical</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
        <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground">
          <option value="all">All Services</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => setPaused(!paused)} className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
        <button onClick={exportLogs} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{filtered.length} entries</span>
        <span>•</span>
        <span>{filtered.filter(l => l.isAnomaly).length} anomalies</span>
        <span>•</span>
        <span className={paused ? 'text-neon-amber' : 'text-primary'}>{paused ? 'Paused' : 'Live'}</span>
      </div>

      {/* Log Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                <th className="text-left px-4 py-2.5 font-medium w-24">Time</th>
                <th className="text-left px-4 py-2.5 font-medium w-20">Level</th>
                <th className="text-left px-4 py-2.5 font-medium w-32">Service</th>
                <th className="text-left px-4 py-2.5 font-medium">Message</th>
                <th className="text-right px-4 py-2.5 font-medium w-16">Score</th>
              </tr>
            </thead>
          </table>
        </div>
        <div ref={containerRef} className="overflow-y-auto terminal-scroll max-h-[calc(100vh-320px)] bg-terminal-bg">
          <table className="w-full text-xs font-mono">
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className={`border-b border-border/30 hover:bg-secondary/20 transition-colors ${log.isAnomaly ? 'bg-destructive/5' : ''}`}>
                  <td className="px-4 py-2 text-muted-foreground w-24">{log.timestamp.toLocaleTimeString('en-US', { hour12: false })}</td>
                  <td className="px-4 py-2 w-20">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase border ${levelBadgeColors[log.level]}`}>{log.level}</span>
                  </td>
                  <td className="px-4 py-2 text-neon-blue w-32 truncate">{log.service}</td>
                  <td className="px-4 py-2 text-foreground">{log.message}</td>
                  <td className="px-4 py-2 text-right w-16">
                    {log.isAnomaly && log.anomalyScore ? (
                      <span className="text-destructive bg-destructive/10 px-1.5 rounded">{log.anomalyScore.toFixed(2)}</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogsMonitor;
