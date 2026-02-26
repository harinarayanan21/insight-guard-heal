import { supabase } from '@/integrations/supabase/client';
import { Anomaly } from '@/types/log-types';

export async function sendAlertEmail(anomaly: Anomaly, recipientEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-alert', {
      body: {
        to: recipientEmail,
        severity: anomaly.severity,
        service: anomaly.service,
        anomalyType: anomaly.type,
        description: anomaly.description,
        score: anomaly.score,
        detectedAt: anomaly.detectedAt.toISOString(),
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send alert:', message);
    return { success: false, error: message };
  }
}
