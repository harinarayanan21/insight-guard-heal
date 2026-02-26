import { useState } from 'react';
import { Settings, Mail, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertSettingsProps {
  email: string;
  onEmailChange: (email: string) => void;
  emailEnabled: boolean;
  onToggleEmail: (enabled: boolean) => void;
  minSeverity: string;
  onMinSeverityChange: (severity: string) => void;
}

export function AlertSettings({ email, onEmailChange, emailEnabled, onToggleEmail, minSeverity, onMinSeverityChange }: AlertSettingsProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(email);

  const handleSave = () => {
    onEmailChange(draft);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        Alert Settings
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Alert Settings
                </h2>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Enable Email Alerts</label>
                  <button
                    onClick={() => onToggleEmail(!emailEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${emailEnabled ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${emailEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Recipient Email (Gmail)</label>
                  <input
                    type="email"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Minimum Severity</label>
                  <select
                    value={minSeverity}
                    onChange={e => onMinSeverityChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm"
                  >
                    <option value="low">Low (all anomalies)</option>
                    <option value="medium">Medium+</option>
                    <option value="high">High+</option>
                    <option value="critical">Critical only</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
