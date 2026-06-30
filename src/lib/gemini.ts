import OpenAI from 'openai';

// OpenRouter API configuration
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('❌ OPENROUTER_API_KEY is not set in environment variables!');
  console.error('   Get your API key from: https://openrouter.ai/keys');
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey || 'MISSING_API_KEY',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Community Hero',
  },
});

// Primary model (fast and capable)
const PRIMARY_MODEL = 'google/gemini-2.0-flash-001';
// Fallback model (cheaper/lighter)
const FALLBACK_MODEL = 'google/gemini-2.0-flash-lite-001';

/**
 * Helper: Generate content with automatic retry and fallback model
 * Handles 429 (rate limit) by retrying with backoff, then falling back to lite model
 */
async function generateWithRetry(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: { maxRetries?: number; initialDelayMs?: number } = {}
): Promise<string> {
  const { maxRetries = 2, initialDelayMs = 2000 } = options;

  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        });

        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        const isRateLimit =
          error?.status === 429 ||
          error?.message?.includes('429') ||
          error?.message?.includes('quota') ||
          error?.message?.includes('Too Many Requests') ||
          error?.message?.includes('rate_limit');

        if (isRateLimit && attempt < maxRetries) {
          const delay = initialDelayMs * Math.pow(2, attempt);
          console.warn(
            `⚠️ Rate limited (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (isRateLimit && model === PRIMARY_MODEL) {
          console.warn('⚠️ Primary model rate limited, trying fallback model...');
          break;
        }

        throw error;
      }
    }
  }

  throw new Error('All models and retries exhausted due to rate limiting. Please try again later.');
}

/**
 * Simple text generation (for quiz, suggestions, insights)
 */
async function generateText(prompt: string): Promise<string> {
  return generateWithRetry([{ role: 'user', content: prompt }]);
}

export async function analyzeIssueImage(imageBase64: string, mimeType: string) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
          },
        },
        {
          type: 'text',
          text: `Analyze this image of a community/civic issue. Provide a JSON response with the following fields:
      {
        "category": "one of: pothole, water_leakage, streetlight, waste_management, road_damage, drainage, public_property, safety_hazard, pollution, other",
        "severity": "one of: low, medium, high, critical",
        "description": "A detailed description of the issue visible in the image",
        "suggested_title": "A short, descriptive title for this issue",
        "estimated_impact": "Brief description of how this affects the community",
        "suggested_department": "Which government department should handle this"
      }
      Only respond with valid JSON, no additional text.`,
        },
      ],
    },
  ];

  try {
    const text = await generateWithRetry(messages);
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error: any) {
    if (
      error?.message?.includes('quota') ||
      error?.message?.includes('429') ||
      error?.message?.includes('rate limit')
    ) {
      throw new Error(
        'AI service quota exceeded. Please try again later or add credits at https://openrouter.ai/credits'
      );
    }
    throw error;
  }
}

export async function getAISuggestions(issueDescription: string, category: string) {
  const prompt = `
    As a civic issue resolution expert, provide actionable suggestions for the following community issue:
    
    Category: ${category}
    Description: ${issueDescription}
    
    Provide a JSON response with:
    {
      "priority_score": number between 1-10,
      "resolution_steps": ["step 1", "step 2", ...],
      "estimated_resolution_time": "e.g., 2-3 days",
      "resources_needed": ["resource 1", "resource 2", ...],
      "similar_issues_tips": "Tips based on similar resolved issues",
      "preventive_measures": ["measure 1", "measure 2", ...]
    }
    Only respond with valid JSON, no additional text.
  `;

  try {
    const text = await generateText(prompt);
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch {
    return {
      priority_score: 5,
      resolution_steps: ['Report to authorities', 'Follow up regularly'],
      estimated_resolution_time: 'Unknown',
      resources_needed: ['Assessment needed'],
      similar_issues_tips: 'AI suggestions temporarily unavailable',
      preventive_measures: ['Regular monitoring'],
    };
  }
}

export async function generateInsights(issues: any[]) {
  const issuesSummary = issues.map((i) => ({
    category: i.category,
    severity: i.severity,
    status: i.status,
    location: i.location?.address,
    createdAt: i.createdAt,
  }));

  const prompt = `
    Analyze these community issues and provide insights for the community dashboard:
    
    Issues data: ${JSON.stringify(issuesSummary)}
    
    Provide a JSON response with:
    {
      "trending_categories": ["most common issue types"],
      "hotspot_areas": ["areas with most issues"],
      "resolution_rate_analysis": "Brief analysis of resolution patterns",
      "predictions": ["predicted upcoming issues based on patterns"],
      "recommendations": ["community-level recommendations"],
      "overall_health_score": number between 1-100
    }
    Only respond with valid JSON, no additional text.
  `;

  try {
    const text = await generateText(prompt);
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch {
    return {
      trending_categories: [],
      hotspot_areas: [],
      resolution_rate_analysis: 'AI insights temporarily unavailable',
      predictions: [],
      recommendations: [],
      overall_health_score: 50,
    };
  }
}

// Export for use in quiz route
export { generateText, openai, PRIMARY_MODEL, FALLBACK_MODEL };
