import { FeedbackEntry } from './types';

export interface AIEnv {
  AI: any; // Workers AI binding
}

/**
 * Categorize feedback using Workers AI
 */
export async function categorizeFeedback(
  content: string,
  ai: any
): Promise<{ category: string; sentiment: string; priority: string }> {
  try {
    // Use Workers AI to analyze the feedback
    const prompt = `Analyze this customer feedback and respond with ONLY a JSON object containing:
- category: one of [error, documentation, ui, feature_request, bug, performance, security, other]
- sentiment: one of [positive, negative, neutral]
- priority: one of [high, medium, low] based on urgency and impact

Feedback: "${content}"

Respond with only the JSON, no other text:`;

    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are a product feedback analyzer. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse the AI response
    const result = JSON.parse(response.response || '{}');
    
    return {
      category: result.category || 'other',
      sentiment: result.sentiment || 'neutral',
      priority: result.priority || 'medium',
    };
  } catch (error) {
    console.error('AI processing error:', error);
    // Fallback to basic heuristics
    return categorizeWithHeuristics(content);
  }
}

/**
 * Fallback categorization using heuristics when AI fails
 */
function categorizeWithHeuristics(content: string): { category: string; sentiment: string; priority: string } {
  const lowerContent = content.toLowerCase();
  
  let category = 'other';
  let sentiment = 'neutral';
  let priority = 'medium';

  // Category detection
  if (lowerContent.includes('error') || lowerContent.includes('500') || lowerContent.includes('failed')) {
    category = 'error';
    priority = 'high';
  } else if (lowerContent.includes('documentation') || lowerContent.includes('docs') || lowerContent.includes('unclear')) {
    category = 'documentation';
    priority = 'medium';
  } else if (lowerContent.includes('ui') || lowerContent.includes('interface') || lowerContent.includes('dashboard')) {
    category = 'ui';
    priority = 'medium';
  } else if (lowerContent.includes('feature') || lowerContent.includes('add') || lowerContent.includes('can we')) {
    category = 'feature_request';
    priority = 'low';
  } else if (lowerContent.includes('bug') || lowerContent.includes('broken')) {
    category = 'bug';
    priority = 'high';
  } else if (lowerContent.includes('slow') || lowerContent.includes('performance') || lowerContent.includes('latency')) {
    category = 'performance';
    priority = 'high';
  } else if (lowerContent.includes('security') || lowerContent.includes('vulnerability') || lowerContent.includes('exposed')) {
    category = 'security';
    priority = 'high';
  }

  // Sentiment detection
  const positiveWords = ['great', 'love', 'awesome', 'excellent', 'good', 'amazing', 'perfect'];
  const negativeWords = ['terrible', 'bad', 'hate', 'worst', 'broken', 'frustrated', 'disappointed'];
  
  if (positiveWords.some(word => lowerContent.includes(word))) {
    sentiment = 'positive';
  } else if (negativeWords.some(word => lowerContent.includes(word))) {
    sentiment = 'negative';
    if (category === 'error' || category === 'bug' || category === 'security') {
      priority = 'high';
    }
  }

  return { category, sentiment, priority };
}

/**
 * Filter out low-quality or spam feedback
 */
export function filterBadData(feedback: FeedbackEntry): boolean {
  if (!feedback.content || feedback.content.trim().length < 10) {
    return false; // Too short
  }

  if (feedback.content.length > 5000) {
    return false; // Too long, likely spam
  }

  // Basic spam detection
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /(http|www\.)/gi, // URLs (can be adjusted based on requirements)
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(feedback.content)) {
      // Allow URLs in some cases, but flag for review
      if (!pattern.source.includes('http')) {
        return false;
      }
    }
  }

  return true;
}
