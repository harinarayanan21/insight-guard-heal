import { motion } from 'framer-motion';

interface HealthScoreGaugeProps {
  score: number;
  servicesUp: number;
  total: number;
}

export function HealthScoreGauge({ score, servicesUp, total }: HealthScoreGaugeProps) {
  const color = score >= 80 ? 'text-primary' : score >= 50 ? 'text-neon-amber' : 'text-destructive';
  const bgColor = score >= 80 ? 'from-primary/20' : score >= 50 ? 'from-neon-amber/20' : 'from-destructive/20';

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-t ${bgColor} to-transparent opacity-30`} />
      <div className="relative z-10 text-center">
        <motion.div
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-bold font-mono ${color}`}
        >
          {score}%
        </motion.div>
        <p className="text-xs text-muted-foreground mt-1">System Health Score</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
          {servicesUp}/{total} services healthy
        </p>
      </div>
    </div>
  );
}
