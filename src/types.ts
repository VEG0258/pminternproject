export interface FeedbackEntry {
  id?: number;
  source: string;
  content: string;
  category?: string;
  sentiment?: string;
  priority?: string;
  created_at?: number;
  processed_at?: number;
  metadata?: Record<string, any>;
}

export interface FeedbackMetadata {
  platform?: string;
  user_id?: string;
  thread_id?: string;
  url?: string;
  tags?: string[];
}

export interface DashboardStats {
  totalFeedback: number;
  byCategory: Record<string, number>;
  bySentiment: Record<string, number>;
  bySource: Record<string, number>;
  recentFeedback: FeedbackEntry[];
}

export interface ReportSummary {
  period: 'daily' | 'weekly';
  date: string;
  totalEntries: number;
  keyInsights: string[];
  topCategories: Array<{ category: string; count: number }>;
  sentimentBreakdown: Record<string, number>;
  recommendations: string[];
}
