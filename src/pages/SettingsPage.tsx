import { Settings, Bell, Shield, Database, Globe } from 'lucide-react';

const settingSections = [
  {
    title: 'Notifications',
    icon: Bell,
    description: 'Configure email, SMS, push notification and webhook integrations',
    items: ['Email alerts', 'SMS notifications', 'Push notifications', 'Webhook endpoints'],
  },
  {
    title: 'Security',
    icon: Shield,
    description: 'Authentication, API keys, and access control settings',
    items: ['API key management', 'SSO configuration', 'Audit log retention', 'IP allowlist'],
  },
  {
    title: 'Data & Storage',
    icon: Database,
    description: 'Log retention policies and data management',
    items: ['Log retention period', 'Data export schedule', 'Backup frequency', 'Archive policy'],
  },
  {
    title: 'Integrations',
    icon: Globe,
    description: 'External service connections and API integrations',
    items: ['GitHub integration', 'Slack webhook', 'PagerDuty', 'Datadog forwarding'],
  },
];

const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      {settingSections.map(section => (
        <div key={section.title} className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-secondary">
              <section.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              <p className="text-xs text-muted-foreground">{section.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {section.items.map(item => (
              <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/30 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsPage;
