import { FeedbackEntry, FeedbackMetadata } from './types';

// Mock feedback sources
const SOURCES = [
  'GitHub Issues',
  'Discord',
  'Customer Support',
  'Twitter/X',
  'Community Forum',
  'Email',
  'Reddit',
  'Stack Overflow'
];

const CATEGORIES = [
  'error',
  'documentation',
  'ui',
  'feature_request',
  'bug',
  'performance',
  'security',
  'other'
];

// Mock feedback templates
const FEEDBACK_TEMPLATES = [
  { content: "I'm experiencing a 500 error when trying to upload large files", category: 'error' },
  { content: "The documentation for API authentication is unclear and needs more examples", category: 'documentation' },
  { content: "The dashboard UI is hard to navigate, especially on mobile devices", category: 'ui' },
  { content: "Can we add dark mode support? This would be a great feature", category: 'feature_request' },
  { content: "Found a bug where the cache doesn't invalidate properly after updates", category: 'bug' },
  { content: "The API response times have been slow lately, especially during peak hours", category: 'performance' },
  { content: "Security concern: I noticed sensitive data might be exposed in error messages", category: 'security' },
  { content: "Great product! Love the new features you've added recently", category: 'other' },
];

export function generateMockFeedback(count: number = 5): FeedbackEntry[] {
  const feedback: FeedbackEntry[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = FEEDBACK_TEMPLATES[Math.floor(Math.random() * FEEDBACK_TEMPLATES.length)];
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    const metadata: FeedbackMetadata = {
      platform: source,
      user_id: `user_${Math.floor(Math.random() * 1000)}`,
      thread_id: `thread_${Math.floor(Math.random() * 10000)}`,
      tags: [template.category]
    };

    feedback.push({
      source,
      content: template.content,
      category: template.category,
      metadata,
      created_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400), // Random time in last 24h
    });
  }

  return feedback;
}

export function simulateStreamingFeedback(
  callback: (feedback: FeedbackEntry) => void,
  intervalMs: number = 5000
): () => void {
  // Simulate streaming by generating feedback at intervals
  const intervalId = setInterval(() => {
    const mockFeedback = generateMockFeedback(1);
    callback(mockFeedback[0]);
  }, intervalMs);

  return () => clearInterval(intervalId);
}
