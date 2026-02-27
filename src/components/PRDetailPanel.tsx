import { useState } from 'react';
import { HealingAction } from '@/types/log-types';
import {
  GitPullRequest, GitMerge, FileCode, MessageSquare,
  Check, X, Clock, User, ChevronDown, ChevronRight,
  Copy, ExternalLink, Shield, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PRDetailPanelProps {
  action: HealingAction;
  onClose: () => void;
  onApply: (id: string) => void;
  onRollback: (id: string) => void;
}

interface ReviewComment {
  id: string;
  author: string;
  avatar: string;
  body: string;
  timestamp: Date;
  type: 'comment' | 'approval' | 'request_changes';
}

function parseDiffFiles(diff: string) {
  const files: { name: string; additions: number; deletions: number; lines: string[] }[] = [];
  const sections = diff.split(/(?=--- )/).filter(Boolean);

  for (const section of sections) {
    const nameMatch = section.match(/\+\+\+ (.+)/);
    const name = nameMatch ? nameMatch[1].trim() : 'unknown';
    const lines = section.split('\n');
    const additions = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
    const deletions = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;
    files.push({ name, additions, deletions, lines });
  }

  if (files.length === 0) {
    files.push({ name: 'changes', additions: 0, deletions: 0, lines: diff.split('\n') });
  }

  return files;
}

const mockReviews: ReviewComment[] = [
  {
    id: 'r1',
    author: 'sentinel-bot',
    avatar: '🤖',
    body: 'Automated analysis: This change addresses the detected anomaly pattern. All safety checks passed.',
    timestamp: new Date(Date.now() - 120000),
    type: 'approval',
  },
  {
    id: 'r2',
    author: 'ops-guardian',
    avatar: '🛡️',
    body: 'Configuration values are within acceptable ranges. No security concerns.',
    timestamp: new Date(Date.now() - 60000),
    type: 'approval',
  },
];

const statusConfig = {
  pending: { icon: Clock, color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/30', label: 'Open', dotColor: 'bg-neon-amber' },
  in_progress: { icon: GitPullRequest, color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/30', label: 'In Progress', dotColor: 'bg-neon-blue' },
  applied: { icon: GitMerge, color: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/30', label: 'Merged', dotColor: 'bg-neon-purple' },
  failed: { icon: X, color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/30', label: 'Failed', dotColor: 'bg-neon-red' },
  rolled_back: { icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', label: 'Reverted', dotColor: 'bg-muted-foreground' },
};

export function PRDetailPanel({ action, onClose, onApply, onRollback }: PRDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'diff' | 'reviews' | 'checks'>('diff');
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(['all']));

  const files = parseDiffFiles(action.diff);
  const totalAdditions = files.reduce((s, f) => s + f.additions, 0);
  const totalDeletions = files.reduce((s, f) => s + f.deletions, 0);
  const sc = statusConfig[action.status];
  const StatusIcon = sc.icon;

  const prNumber = action.prUrl?.match(/\/pull\/(\d+)/)?.[1] || '???';

  const toggleFile = (name: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const copyDiff = () => {
    navigator.clipboard.writeText(action.diff);
    toast.success('Diff copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${sc.bg} ${sc.border} border`}>
              <StatusIcon className={`w-5 h-5 ${sc.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-foreground truncate">{action.title}</h2>
                <span className="text-xs text-muted-foreground font-mono shrink-0">#{prNumber}</span>
              </div>
              <p className="text-xs text-muted-foreground">{action.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color} ${sc.border} border`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />
                  {sc.label}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {files.length} file{files.length > 1 ? 's' : ''} changed
                </span>
                <span className="text-[11px] text-neon-green font-mono">+{totalAdditions}</span>
                <span className="text-[11px] text-neon-red font-mono">-{totalDeletions}</span>
                <span className="text-[11px] text-muted-foreground">
                  {action.createdAt.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-border">
          {[
            { key: 'diff' as const, label: 'Files Changed', icon: FileCode, count: files.length },
            { key: 'reviews' as const, label: 'Reviews', icon: MessageSquare, count: mockReviews.length },
            { key: 'checks' as const, label: 'Checks', icon: Shield, count: 3 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary text-[10px]">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto terminal-scroll">
          {activeTab === 'diff' && (
            <div className="p-3 space-y-2">
              <div className="flex justify-end mb-1">
                <button onClick={copyDiff} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded bg-secondary">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              {files.map((file, fi) => {
                const isExpanded = expandedFiles.has('all') || expandedFiles.has(file.name);
                return (
                  <div key={fi} className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFile(file.name)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary transition-colors text-left"
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                      <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-mono text-foreground flex-1 truncate">{file.name}</span>
                      <span className="text-[10px] text-neon-green font-mono">+{file.additions}</span>
                      <span className="text-[10px] text-neon-red font-mono">-{file.deletions}</span>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-terminal-bg p-0">
                            {file.lines.map((line, li) => {
                              const isAdd = line.startsWith('+') && !line.startsWith('+++');
                              const isDel = line.startsWith('-') && !line.startsWith('---');
                              const isHunk = line.startsWith('@@');
                              const isMeta = line.startsWith('---') || line.startsWith('+++');
                              return (
                                <div
                                  key={li}
                                  className={`flex text-[11px] font-mono leading-5 ${
                                    isAdd ? 'bg-neon-green/5' :
                                    isDel ? 'bg-neon-red/5' :
                                    isHunk ? 'bg-neon-blue/5' : ''
                                  }`}
                                >
                                  <span className="w-10 shrink-0 text-right pr-2 text-muted-foreground/40 select-none border-r border-border/30">
                                    {!isMeta && !isHunk ? li + 1 : ''}
                                  </span>
                                  <span className={`px-3 whitespace-pre ${
                                    isAdd ? 'text-neon-green' :
                                    isDel ? 'text-neon-red' :
                                    isHunk ? 'text-neon-blue' :
                                    isMeta ? 'text-foreground font-bold' :
                                    'text-muted-foreground'
                                  }`}>
                                    {line}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="p-4 space-y-3">
              {mockReviews.map(review => (
                <div key={review.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm shrink-0">
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground">{review.author}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        review.type === 'approval'
                          ? 'bg-neon-green/10 text-neon-green border-neon-green/20'
                          : review.type === 'request_changes'
                          ? 'bg-neon-red/10 text-neon-red border-neon-red/20'
                          : 'bg-secondary text-muted-foreground border-border'
                      }`}>
                        {review.type === 'approval' ? '✓ Approved' : review.type === 'request_changes' ? '✗ Changes requested' : 'Commented'}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {review.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{review.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'checks' && (
            <div className="p-4 space-y-2">
              {[
                { name: 'Safety Analysis', status: 'passed', detail: 'No breaking changes detected' },
                { name: 'Configuration Validation', status: 'passed', detail: 'All values within valid ranges' },
                { name: 'Rollback Verification', status: 'passed', detail: 'Rollback path verified and tested' },
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-secondary/30">
                  <Check className="w-4 h-4 text-neon-green shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-foreground">{check.name}</span>
                    <p className="text-[10px] text-muted-foreground">{check.detail}</p>
                  </div>
                  <span className="text-[10px] font-medium text-neon-green">Passed</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex items-center gap-2">
          {action.prUrl && (
            <a
              href={action.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> View on GitHub
            </a>
          )}
          <div className="flex-1" />
          {action.status === 'applied' && (
            <button
              onClick={() => { onRollback(action.id); onClose(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-neon-amber/10 text-neon-amber border border-neon-amber/20 text-xs font-medium hover:bg-neon-amber/20 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Revert
            </button>
          )}
          {action.status === 'pending' && (
            <button
              onClick={() => { onApply(action.id); onClose(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              <GitMerge className="w-3.5 h-3.5" /> Merge & Apply
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}