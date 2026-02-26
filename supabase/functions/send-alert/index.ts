import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AlertRequest {
  to: string;
  severity: string;
  service: string;
  anomalyType: string;
  description: string;
  score: number;
  detectedAt: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(apiKey);
    const { to, severity, service, anomalyType, description, score, detectedAt }: AlertRequest = await req.json();

    if (!to || !severity || !service) {
      throw new Error('Missing required fields: to, severity, service');
    }

    const severityColor = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#f97316',
      critical: '#ef4444',
    }[severity] || '#ef4444';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#0f1419;border-radius:12px;overflow:hidden;">
      <div style="padding:24px;border-bottom:1px solid #1e2a35;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">🛡️</span>
          <span style="color:#22c55e;font-size:18px;font-weight:700;">LogSentinel</span>
        </div>
      </div>
      <div style="padding:24px;">
        <div style="background:${severityColor}15;border:1px solid ${severityColor}40;border-radius:8px;padding:16px;margin-bottom:20px;">
          <span style="color:${severityColor};font-size:14px;font-weight:700;text-transform:uppercase;">
            ⚠️ ${severity} SEVERITY ANOMALY DETECTED
          </span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px;">Service</td>
            <td style="padding:8px 0;color:#e5e7eb;font-size:13px;font-weight:600;">${service}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;">Anomaly Type</td>
            <td style="padding:8px 0;color:#e5e7eb;font-size:13px;">${anomalyType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;">Score</td>
            <td style="padding:8px 0;color:${severityColor};font-size:13px;font-weight:700;">${(score * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;">Detected At</td>
            <td style="padding:8px 0;color:#e5e7eb;font-size:13px;">${detectedAt}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top;">Description</td>
            <td style="padding:8px 0;color:#e5e7eb;font-size:13px;">${description}</td>
          </tr>
        </table>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #1e2a35;text-align:center;">
        <span style="color:#6b7280;font-size:11px;">LogSentinel — Automated Anomaly Detection</span>
      </div>
    </div>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: 'LogSentinel <onboarding@resend.dev>',
      to: [to],
      subject: `[${severity.toUpperCase()}] Anomaly in ${service}: ${anomalyType}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Email send failed: ${JSON.stringify(error)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending alert:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
