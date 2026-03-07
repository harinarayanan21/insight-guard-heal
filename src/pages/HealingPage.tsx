import { useLogStream } from '@/hooks/use-log-stream';
import { HealingPanel } from '@/components/HealingPanel';
import { Wrench, Check, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const HealingPage = () => {
  const { healingActions, applyHealing, rollbackHealing } = useLogStream();

  const pending = healingActions.filter(a => a.status === 'pending').length;
  const applied = healingActions.filter(a => a.status === 'applied').length;
  const rolledBack = healingActions.filter(a => a.status === 'rolled_back').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: pending, icon: Clock, color: 'text-neon-amber' },
          { label: 'Applied', value: applied, icon: Check, color: 'text-primary' },
          { label: 'Rolled Back', value: rolledBack, icon: RotateCcw, color: 'text-muted-foreground' },
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

      <HealingPanel actions={healingActions} onApply={applyHealing} onRollback={rollbackHealing} />
    </div>
  );
};

export default HealingPage;
