import { useRef, useEffect } from 'react';
import { LogEntry } from '@/types/log-types';
import { Pause, Play } from 'lucide-react';
import { useState } from 'react';

const levelColors: Record<string, string> = {
  info: 'text-neon-green',
  debug: 'text-muted-foreground',
  warn: 'text-neon-amber',
  error: 'text-neon-red',
  critical: 'text-neon-red font-bold',
};

const levelBadgeColors: Record<string, string> = {
  info: 'bg-neon-green/10 text-neon-green border-neon-green/20',
  debug: 'bg-muted text-muted-foreground border-border',
  warn: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
  error: 'bg-neon-red/10 text-neon-red border-neon-red/20',
  critical: 'bg-neon-red/20 text-neon-red border-neon-red/30',
};

interface LogStreamProps {
  logs: LogEntry[];
}

export function LogStream({ logs }: LogStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? logs : filter === 'anomaly' ? logs.filter(l => l.isAnomaly) : logs.filter(l => l.level === filter);

  useEffect(() => {
    if (!paused && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs, paused]);

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-[400px]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-glow" />
          <span className="text-sm font-semibold text-foreground">Live Log Stream</span>
          <span className="text-xs text-muted-foreground font-mono">({logs.length} entries)</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded border border-border"
          >
            <option value="all">All</option>
            <option value="anomaly">Anomalies</option>
            <option value="error">Errors</option>
            <option value="critical">Critical</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
          </select>
          <button
            onClick={() => setPaused(!paused)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto terminal-scroll bg-terminal-bg p-2 font-mono text-xs"
      >
        {filtered.map(log => (
          <div
            key={log.id}
            className={`py-0.5 px-2 rounded flex items-start gap-2 log-line-enter ${
              log.isAnomaly ? 'bg-neon-red/5 border-l-2 border-neon-red/40' : 'hover:bg-secondary/30'
            }`}
          >
            <span className="text-muted-foreground shrink-0 w-20">
              {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className={`shrink-0 w-16 px-1.5 py-0.5 rounded text-center text-[10px] uppercase border ${levelBadgeColors[log.level]}`}>
              {log.level}
            </span>
            <span className="text-neon-blue shrink-0 w-28 truncate">{log.service}</span>
            <span className={levelColors[log.level]}>{log.message}</span>
            {log.isAnomaly && log.anomalyScore && (
              <span className="ml-auto shrink-0 text-neon-red text-[10px] bg-neon-red/10 px-1.5 rounded">
                score: {log.anomalyScore.toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
