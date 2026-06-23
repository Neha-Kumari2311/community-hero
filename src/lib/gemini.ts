import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
export const geminiVisionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function analyzeIssueImage(imageBase64: string, mimeType: string) {
  const result = await geminiVisionModel.generateContent([
    {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    },
    {
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
  ]);

  const response = result.response;
  const text = response.text();
  
  try {
    // Clean the response - remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch {
    return {
      category: 'other',
      severity: 'medium',
      description: text,
      suggested_title: 'Community Issue',
      estimated_impact: 'Needs assessment',
      suggested_department: 'General Administration',
    };
  }
}

export async function getAISuggestions(issueDescription: string, category: string) {
  const result = await geminiModel.generateContent(`
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
  `);

  const text = result.response.text();
  
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch {
    return {
      priority_score: 5,
      resolution_steps: ['Report to authorities', 'Follow up regularly'],
      estimated_resolution_time: 'Unknown',
      resources_needed: ['Assessment needed'],
      similar_issues_tips: text,
      preventive_measures: ['Regular monitoring'],
    };
  }
}

export async function generateInsights(issues: any[]) {
  const issuesSummary = issues.map(i => ({
    category: i.category,
    severity: i.severity,
    status: i.status,
    location: i.location?.address,
    createdAt: i.createdAt,
  }));

  const result = await geminiModel.generateContent(`
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
  `);

  const text = result.response.text();
  
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch {
    return {
      trending_categories: [],
      hotspot_areas: [],
      resolution_rate_analysis: text,
      predictions: [],
      recommendations: [],
      overall_health_score: 50,
    };
  }
}
