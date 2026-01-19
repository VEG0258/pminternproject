import { FeedbackEntry, DashboardStats } from './types';

export interface D1Database {
  prepare(query: string): any;
}

// Re-export for use in other modules
export { type D1Database };

export async function insertFeedback(db: D1Database, feedback: FeedbackEntry): Promise<number> {
  const stmt = db.prepare(
    `INSERT INTO feedback_entries (source, content, category, sentiment, priority, created_at, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const result = await stmt.bind(
    feedback.source,
    feedback.content,
    feedback.category || null,
    feedback.sentiment || null,
    feedback.priority || null,
    feedback.created_at || Math.floor(Date.now() / 1000),
    feedback.metadata ? JSON.stringify(feedback.metadata) : null
  ).run();

  return result.meta.last_row_id as number;
}

export async function getDashboardStats(db: D1Database, days: number = 7): Promise<DashboardStats> {
  const cutoffTime = Math.floor(Date.now() / 1000) - (days * 86400);

  // Get total feedback
  const totalResult = await db.prepare(
    'SELECT COUNT(*) as count FROM feedback_entries WHERE created_at >= ?'
  ).bind(cutoffTime).first();

  // Get by category
  const categoryResult = await db.prepare(
    `SELECT category, COUNT(*) as count 
     FROM feedback_entries 
     WHERE created_at >= ? AND category IS NOT NULL
     GROUP BY category`
  ).bind(cutoffTime).all();

  // Get by sentiment
  const sentimentResult = await db.prepare(
    `SELECT sentiment, COUNT(*) as count 
     FROM feedback_entries 
     WHERE created_at >= ? AND sentiment IS NOT NULL
     GROUP BY sentiment`
  ).bind(cutoffTime).all();

  // Get by source
  const sourceResult = await db.prepare(
    `SELECT source, COUNT(*) as count 
     FROM feedback_entries 
     WHERE created_at >= ? 
     GROUP BY source`
  ).bind(cutoffTime).all();

  // Get recent feedback
  const recentResult = await db.prepare(
    `SELECT id, source, content, category, sentiment, priority, created_at, metadata
     FROM feedback_entries 
     WHERE created_at >= ?
     ORDER BY created_at DESC
     LIMIT 20`
  ).bind(cutoffTime).all();

  const byCategory: Record<string, number> = {};
  categoryResult.results?.forEach((row: any) => {
    byCategory[row.category] = row.count;
  });

  const bySentiment: Record<string, number> = {};
  sentimentResult.results?.forEach((row: any) => {
    bySentiment[row.sentiment] = row.count;
  });

  const bySource: Record<string, number> = {};
  sourceResult.results?.forEach((row: any) => {
    bySource[row.source] = row.count;
  });

  const recentFeedback = recentResult.results?.map((row: any) => ({
    id: row.id,
    source: row.source,
    content: row.content,
    category: row.category,
    sentiment: row.sentiment,
    priority: row.priority,
    created_at: row.created_at,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  })) || [];

  return {
    totalFeedback: (totalResult?.count as number) || 0,
    byCategory,
    bySentiment,
    bySource,
    recentFeedback,
  };
}
