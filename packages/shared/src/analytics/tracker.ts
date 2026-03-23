import type { AnalyticsEvent, AnalyticsEventType } from './types';

const FLUSH_INTERVAL = 5_000; // 5 seconds
const FLUSH_THRESHOLD = 10; // flush when queue hits this size
const MAX_QUEUE_SIZE = 500; // cap to prevent memory leaks on persistent failures

export class AnalyticsTracker {
  private queue: AnalyticsEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private endpoint: string;
  private sessionId: string;
  private projectId: string;
  private nodeId: string | null = null;
  private deviceInfo: AnalyticsEvent['deviceInfo'];

  constructor(opts: {
    endpoint: string;
    projectId: string;
    deviceInfo?: AnalyticsEvent['deviceInfo'];
  }) {
    this.endpoint = opts.endpoint;
    this.projectId = opts.projectId;
    this.sessionId = this.generateSessionId();
    this.deviceInfo = opts.deviceInfo;
    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL);
  }

  setNodeId(nodeId: string) {
    this.nodeId = nodeId;
  }

  track(
    eventType: AnalyticsEventType,
    opts?: {
      nodeId?: string;
      componentId?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const event: AnalyticsEvent = {
      projectId: this.projectId,
      sessionId: this.sessionId,
      eventType,
      nodeId: opts?.nodeId ?? this.nodeId ?? undefined,
      componentId: opts?.componentId,
      metadata: opts?.metadata,
      deviceInfo: this.deviceInfo,
      timestamp: new Date().toISOString(),
    };
    this.queue.push(event);

    if (this.queue.length >= FLUSH_THRESHOLD) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0);
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });
    } catch {
      // Re-queue on failure, but cap to prevent memory leaks
      if (this.queue.length < MAX_QUEUE_SIZE) {
        this.queue.unshift(...batch);
      }
    }
  }

  async destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await this.flush();
  }

  private generateSessionId(): string {
    return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
