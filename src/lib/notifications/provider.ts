export type SmsMessage = { to: string; body: string };
export type PushMessage = { userId: string; title: string; body: string };

export interface NotificationProvider {
  sendSms(message: SmsMessage): Promise<{ ok: boolean; providerRef?: string }>;
  sendPush(message: PushMessage): Promise<{ ok: boolean; providerRef?: string }>;
}

/**
 * Default provider for local development and until a real SMS/push vendor is
 * wired in (Section 3 non-goal). Logs and returns success so call sites never
 * need special-casing between "real" and "stub" delivery.
 */
export class LogNotificationProvider implements NotificationProvider {
  async sendSms(message: SmsMessage) {
    console.log(`[notifications:sms] to=${message.to} body=${message.body}`);
    return { ok: true, providerRef: `log-${Date.now()}` };
  }

  async sendPush(message: PushMessage) {
    console.log(`[notifications:push] userId=${message.userId} title=${message.title}`);
    return { ok: true, providerRef: `log-${Date.now()}` };
  }
}

let provider: NotificationProvider | null = null;

export function getNotificationProvider(): NotificationProvider {
  if (!provider) {
    // Swap on NOTIFICATIONS_PROVIDER env var when a real vendor is integrated.
    provider = new LogNotificationProvider();
  }
  return provider;
}
