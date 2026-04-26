import { useLogStream } from '@/hooks/use-log-stream';
import { StatsBar } from '@/components/StatsBar';
import { AnomalyChart } from '@/components/AnomalyChart';
import { ServiceHealthGrid } from '@/components/ServiceHealthGrid';
import { AlertPanel } from '@/components/AlertPanel';
import { HealingPanel } from '@/components/HealingPanel';
import { SeverityPieChart } from '@/components/SeverityPieChart';
import { RecentIncidentsTable } from '@/components/RecentIncidentsTable';
import { AIRecommendations } from '@/components/AIRecommendations';
import { HealthScoreGauge } from '@/components/HealthScoreGauge';
import { TasksWidget } from '@/components/TasksWidget';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const {
    logs, anomalies, alerts, healingActions, serviceHealth,
    timeSeriesData, stats, acknowledgeAlert, resolveAlert,
    applyHealing, rollbackHealing,
    alertEmail, setAlertEmail, emailEnabled, setEmailEnabled, minSeverity, setMinSeverity,
  } = useLogStream();

  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const servicesDown = serviceHealth.filter(s => s.status === 'down').length;
  const healthScore = Math.round(
    ((serviceHealth.filter(s => s.status === 'healthy').length / Math.max(serviceHealth.length, 1)) * 100)
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <StatsBar stats={stats} activeAlerts={activeAlerts} servicesDown={servicesDown} />
      </motion.div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AnomalyChart data={timeSeriesData} />
        </div>
        <div className="grid grid-rows-2 gap-4">
          <HealthScoreGauge score={healthScore} servicesUp={serviceHealth.filter(s => s.status === 'healthy').length} total={serviceHealth.length} />
          <SeverityPieChart alerts={alerts} />
        </div>
      </div>

      {/* Row 3: Service Health */}
      <ServiceHealthGrid services={serviceHealth} />

      {/* Row 4: AI Recommendations + Tasks + Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AIRecommendations anomalies={anomalies} serviceHealth={serviceHealth} />
        <TasksWidget />
        <RecentIncidentsTable alerts={alerts} />
      </div>

      {/* Row 5: Alerts + Healing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} onResolve={resolveAlert} />
        <HealingPanel actions={healingActions} onApply={applyHealing} onRollback={rollbackHealing} />
      </div>
    </div>
  );
};

export default Dashboard;
