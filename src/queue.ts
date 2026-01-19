import { MessageBatch } from '@cloudflare/workers-types';
import { FeedbackEntry } from './types';
import { categorizeFeedback, filterBadData } from './ai-processor';
import { insertFeedback, type D1Database } from './database';

export interface QueueEnv {
  data: D1Database;
  AI: any;
}

export default {
  async queue(batch: MessageBatch<FeedbackEntry>, env: QueueEnv): Promise<void> {
    for (const message of batch.messages) {
      try {
        const feedback = message.body;

        // Filter out bad data
        if (!filterBadData(feedback)) {
          console.log('Filtered out bad feedback:', feedback.id || 'unknown');
          message.ack();
          continue;
        }

        // Process with AI to categorize and analyze
        const aiResult = await categorizeFeedback(feedback.content, env.AI);

        // Update feedback with AI results
        const processedFeedback: FeedbackEntry = {
          ...feedback,
          category: aiResult.category,
          sentiment: aiResult.sentiment,
          priority: aiResult.priority,
          processed_at: Math.floor(Date.now() / 1000),
        };

        // Store in database
        await insertFeedback(env.data, processedFeedback);

        console.log(`Processed feedback: ${processedFeedback.id || 'new'} - ${processedFeedback.category}`);
        message.ack();
      } catch (error) {
        console.error('Error processing queue message:', error);
        message.retry();
      }
    }
  },
};
