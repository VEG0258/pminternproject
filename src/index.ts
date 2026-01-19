import { MessageBatch } from '@cloudflare/workers-types';
import { generateMockFeedback } from './mock-streaming';
import { getDashboardStats, type D1Database } from './database';
import { generateReportSummary, formatReportAsEmail } from './reports';
import { FeedbackEntry } from './types';
import { dashboardHTML } from './dashboard';
import queueHandler from './queue';

export interface Env {
  data: D1Database;
  AI: any;
  'feedback-queue': Queue<FeedbackEntry>;
  SUMMARIES_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Dashboard route
    if (url.pathname === '/' || url.pathname === '/dashboard') {
      return new Response(dashboardHTML, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // API: Get dashboard stats
    if (url.pathname === '/api/stats') {
      const days = parseInt(url.searchParams.get('days') || '7');
      const stats = await getDashboardStats(env.data, days);
      return Response.json(stats);
    }

    // API: Stream mock feedback (simulates receiving feedback from multiple sources)
    if (url.pathname === '/api/stream-feedback') {
      const count = parseInt(url.searchParams.get('count') || '10');
      const feedback = generateMockFeedback(count);

      // Send feedback to queue for asynchronous processing
      for (const entry of feedback) {
        await env['feedback-queue'].send(entry);
      }

      return Response.json({
        message: `Queued ${feedback.length} feedback entries for processing`,
        entries: feedback,
      });
    }

    // API: Generate and get daily report
    if (url.pathname === '/api/report/daily') {
      const report = await generateReportSummary(env.data, env.AI, 'daily');
      const emailText = formatReportAsEmail(report);
      
      // Store in KV for later retrieval
      await env.SUMMARIES_KV.put(`daily-${report.date}`, emailText);
      
      return Response.json({
        ...report,
        emailText,
      });
    }

    // API: Generate and get weekly report
    if (url.pathname === '/api/report/weekly') {
      const report = await generateReportSummary(env.data, env.AI, 'weekly');
      const emailText = formatReportAsEmail(report);
      
      // Store in KV for later retrieval
      await env.SUMMARIES_KV.put(`weekly-${report.date}`, emailText);
      
      return Response.json({
        ...report,
        emailText,
      });
    }

    // API: Get stored report
    if (url.pathname.startsWith('/api/report/')) {
      const reportType = url.pathname.split('/')[3]; // daily or weekly
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const stored = await env.SUMMARIES_KV.get(`${reportType}-${date}`);
      
      if (stored) {
        return new Response(stored, {
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // API: Health check
    if (url.pathname === '/api/health') {
      return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    return new Response('Not Found', { status: 404 });
  },

  // Queue consumer handler for processing feedback asynchronously
  async queue(batch: MessageBatch<FeedbackEntry>, env: Env): Promise<void> {
    await queueHandler.queue(batch, env);
  },
};
