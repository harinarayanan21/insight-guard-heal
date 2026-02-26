import { HealingAction } from '@/types/log-types';
import { GitPullRequest, Play, RotateCcw, Check, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface HealingPanelProps {
  actions: HealingAction[];
  onApply: (id: string) => void;
  onRollback: (id: string) => void;
}

const statusBadge: Record<string, { className: string; label: string }> = {
  pending: { className: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20', label: 'Pending' },
  in_progress: { className: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20', label: 'Applying...' },
  applied: { className: 'bg-neon-green/10 text-neon-green border-neon-green/20', label: 'Applied' },
  failed: { className: 'bg-neon-red/10 text-neon-red border-neon-red/20', label: 'Failed' },
  rolled_back: { className: 'bg-muted text-muted-foreground border-border', label: 'Rolled Back' },
};

export function HealingPanel({ actions, onApply, onRollback }: HealingPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-[350px]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <GitPullRequest className="w-4 h-4 text-neon-blue" />
        <span className="text-sm font-semibold text-foreground">Self-Healing Actions</span>
        <span className="ml-auto text-xs bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded-full font-mono">
          {actions.filter(a => a.status === 'pending').length} pending
        </span>
      </div>
      <div className="flex-1 overflow-y-auto terminal-scroll p-2 space-y-2">
        <AnimatePresence>
          {actions.map(action => {
            const badge = statusBadge[action.status];
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-border bg-secondary/30 overflow-hidden"
              >
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground">{action.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badge.className}`}>
                          {action.status === 'in_progress' && <Loader2 className="w-2.5 h-2.5 inline mr-1 animate-spin" />}
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{action.description}</p>
                      {action.prUrl && (
                        <a href={action.prUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-neon-blue hover:underline mt-1 inline-block">
                          {action.prUrl}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {action.status === 'pending' && (
                        <button
                          onClick={() => onApply(action.id)}
                          className="p-1.5 rounded bg-neon-green/10 hover:bg-neon-green/20 text-neon-green transition-colors"
                          title="Apply Fix"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                      )}
                      {action.status === 'applied' && (
                        <button
                          onClick={() => onRollback(action.id)}
                          className="p-1.5 rounded bg-neon-amber/10 hover:bg-neon-amber/20 text-neon-amber transition-colors"
                          title="Rollback"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => setExpanded(expanded === action.id ? null : action.id)}
                        className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors text-[10px] font-mono"
                      >
                        diff
                      </button>
                    </div>
                  </div>
                </div>
                {expanded === action.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-border bg-terminal-bg p-3 overflow-x-auto"
                  >
                    <pre className="text-[10px] font-mono leading-relaxed">
                      {action.diff.split('\n').map((line, i) => (
                        <div
                          key={i}
                          className={
                            line.startsWith('+') ? 'text-neon-green' :
                            line.startsWith('-') ? 'text-neon-red' :
                            line.startsWith('@@') ? 'text-neon-blue' :
                            line.startsWith('---') || line.startsWith('+++') ? 'text-foreground font-bold' :
                            'text-muted-foreground'
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </pre>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {actions.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No healing actions yet
          </div>
        )}
      </div>
    </div>
  );
}
