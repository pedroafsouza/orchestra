export type AnalyticsEventType =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'navigation'
  | 'datasource_action'
  | 'checkbox_toggle'
  | 'switch_toggle'
  | 'session_start'
  | 'session_end';

export interface AnalyticsEvent {
  projectId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  nodeId?: string;
  componentId?: string;
  metadata?: Record<string, unknown>;
  deviceInfo?: {
    platform?: string;
    screenWidth?: number;
    screenHeight?: number;
    userAgent?: string;
  };
  timestamp: string; // ISO 8601
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalSessions: number;
  eventsByType: { eventType: string; count: number }[];
  eventsByDay: { date: string; count: number }[];
  topScreens: { nodeId: string; count: number }[];
  topComponents: { componentId: string; eventType: string; count: number }[];
  navigationPaths: { source: string; target: string; count: number }[];
}
