/**
 * TheSalesSherpa AI Intelligence Service
 * 
 * Provides intelligent insights and recommendations including:
 * - News and signal monitoring
 * - AI-powered outreach suggestions
 * - Action prioritization
 * - Natural language processing for context extraction
 * - Smart alert generation
 */

import OpenAI from 'openai';

export interface IntelligenceConfig {
  openaiApiKey: string;
  newsApiKey?: string;
  model?: string;
}

export interface AccountContext {
  id: string;
  name: string;
  industry?: string;
  urgencyScore: number;
  contacts: ContactContext[];
  recentAlerts: AlertContext[];
  recentActivities: ActivityContext[];
  relationships: RelationshipContext[];
}

export interface ContactContext {
  id: string;
  name: string;
  title?: string;
  email?: string;
  separationDegree?: number;
  influence: {
    budget: number;
    technical: number;
    relationship: number;
    urgency: number;
  };
  lastContacted?: Date;
}

export interface AlertContext {
  type: string;
  message: string;
  urgency: string;
  createdAt: Date;
  sourceUrl?: string;
}

export interface ActivityContext {
  type: string;
  subject?: string;
  date: Date;
  outcome?: string;
}

export interface RelationshipContext {
  targetName: string;
  targetTitle?: string;
  degrees: number;
  connectorName?: string;
  confidence: number;
}

export interface ActionRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  targetContact?: {
    id: string;
    name: string;
    title?: string;
  };
  suggestedMessage?: string;
  deadline?: Date;
  successProbability: number;
  category: 'outreach' | 'followup' | 'research' | 'intro_request' | 'relationship_building';
}

export interface NewsSignal {
  id: string;
  companyName: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  publishedAt: Date;
  signalType: SignalType;
  urgencyImpact: number;
  aiAnalysis?: string;
  recommendedAction?: string;
  confidence: number;
}

export type SignalType = 
  | 'funding'
  | 'hiring'
  | 'executive_change'
  | 'expansion'
  | 'acquisition'
  | 'partnership'
  | 'product_launch'
  | 'earnings'
  | 'layoffs'
  | 'technology_adoption'
  | 'competitor_mention'
  | 'general_news';

export interface OutreachTemplate {
  id: string;
  type: 'email' | 'linkedin' | 'intro_request' | 'call_script';
  subject?: string;
  body: string;
  personalization: string[];
  expectedResponseRate: number;
}

export interface DashboardIntelligence {
  totalAccounts: number;
  highPriorityAccounts: number;
  totalAlerts: number;
  averageUrgencyScore: number;
  topActions: ActionRecommendation[];
  recentActivities: ActivitySummary[];
  weeklyStats: WeeklyStats;
}

export interface ActivitySummary {
  message: string;
  type: 'alert' | 'news' | 'activity';
  timestamp: Date;
}

export interface WeeklyStats {
  newOpportunities: number;
  completedActivities: number;
  introductionsRequested: number;
  responseRate: number;
}

export class IntelligenceService {
  private openai: OpenAI;
  private config: IntelligenceConfig;

  constructor(config: IntelligenceConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  /**
   * Generate AI-powered action recommendations for an account
   */
  async generateActionRecommendations(
    account: AccountContext
  ): Promise<ActionRecommendation[]> {
    const recommendations: ActionRecommendation[] = [];

    // Analyze relationship opportunities
    const relationshipActions = this.analyzeRelationshipOpportunities(account);
    recommendations.push(...relationshipActions);

    // Analyze timing-based actions
    const timingActions = this.analyzeTimingOpportunities(account);
    recommendations.push(...timingActions);

    // Analyze alert-based actions
    const alertActions = this.analyzeAlertOpportunities(account);
    recommendations.push(...alertActions);

    // Use AI for advanced recommendations
    const aiRecommendations = await this.getAIRecommendations(account);
    recommendations.push(...aiRecommendations);

    // Sort by priority and success probability
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.successProbability - a.successProbability;
      })
      .slice(0, 10);  // Return top 10 recommendations
  }

  /**
   * Analyze relationship opportunities
   */
  private analyzeRelationshipOpportunities(
    account: AccountContext
  ): ActionRecommendation[] {
    const actions: ActionRecommendation[] = [];

    // Find warm intro opportunities (1-2 degrees)
    const warmConnections = account.relationships.filter(r => r.degrees <= 2);
    
    for (const conn of warmConnections) {
      const successProb = conn.degrees === 1 ? 0.85 : 0.70;
      
      actions.push({
        id: `intro-${conn.targetName.replace(/\s/g, '-').toLowerCase()}`,
        priority: conn.degrees === 1 ? 'high' : 'medium',
        action: conn.degrees === 1 
          ? `Reach out directly to ${conn.targetName}`
          : `Request intro to ${conn.targetName} via ${conn.connectorName}`,
        reason: conn.degrees === 1 
          ? `Direct connection - high success rate`
          : `Strong path through ${conn.connectorName}`,
        targetContact: {
          id: conn.targetName,
          name: conn.targetName,
          title: conn.targetTitle
        },
        successProbability: successProb * conn.confidence,
        category: conn.degrees === 1 ? 'outreach' : 'intro_request',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 1 week
      });
    }

    return actions;
  }

  /**
   * Analyze timing-based opportunities
   */
  private analyzeTimingOpportunities(
    account: AccountContext
  ): ActionRecommendation[] {
    const actions: ActionRecommendation[] = [];
    const now = new Date();

    // Check for stale contacts
    for (const contact of account.contacts) {
      if (contact.lastContacted) {
        const daysSinceContact = Math.floor(
          (now.getTime() - new Date(contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceContact > 30 && contact.influence.budget >= 70) {
          actions.push({
            id: `followup-${contact.id}`,
            priority: daysSinceContact > 60 ? 'high' : 'medium',
            action: `Re-engage with ${contact.name}`,
            reason: `No contact in ${daysSinceContact} days - high budget influence decision maker`,
            targetContact: {
              id: contact.id,
              name: contact.name,
              title: contact.title
            },
            successProbability: Math.max(0.3, 0.7 - (daysSinceContact / 100)),
            category: 'followup',
            deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)  // 3 days
          });
        }
      }
    }

    // High urgency score but no recent activity
    if (account.urgencyScore >= 80 && account.recentActivities.length === 0) {
      actions.push({
        id: `urgent-engagement-${account.id}`,
        priority: 'critical',
        action: `Immediate outreach to ${account.name}`,
        reason: `Urgency score ${account.urgencyScore}/100 with no recent engagement`,
        successProbability: 0.65,
        category: 'outreach',
        deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000)  // Tomorrow
      });
    }

    return actions;
  }

  /**
   * Analyze alert-based opportunities
   */
  private analyzeAlertOpportunities(
    account: AccountContext
  ): ActionRecommendation[] {
    const actions: ActionRecommendation[] = [];

    for (const alert of account.recentAlerts) {
      let action: string;
      let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
      let category: ActionRecommendation['category'] = 'outreach';
      let successProb = 0.5;

      switch (alert.type) {
        case 'funding':
          action = `Leverage funding news: "${alert.message.slice(0, 50)}..."`;
          priority = alert.urgency === 'high' ? 'critical' : 'high';
          successProb = 0.7;
          break;
        case 'executive_change':
          action = `Connect with new executive at ${account.name}`;
          priority = 'high';
          successProb = 0.65;
          category = 'relationship_building';
          break;
        case 'hiring':
          action = `Discuss expansion needs - ${account.name} is hiring`;
          priority = 'medium';
          successProb = 0.55;
          break;
        case 'expansion':
          action = `Position for expansion initiative at ${account.name}`;
          priority = 'high';
          successProb = 0.6;
          break;
        case 'contract':
          action = `Address contract renewal timing at ${account.name}`;
          priority = 'critical';
          successProb = 0.75;
          break;
        default:
          action = `Follow up on: ${alert.message.slice(0, 50)}...`;
          priority = 'low';
          successProb = 0.4;
      }

      actions.push({
        id: `alert-${alert.type}-${Date.now()}`,
        priority,
        action,
        reason: alert.message,
        successProbability: successProb,
        category,
        deadline: priority === 'critical' 
          ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)  // 2 days
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 1 week
      });
    }

    return actions;
  }

  /**
   * Get AI-powered recommendations using GPT-4
   */
  private async getAIRecommendations(
    account: AccountContext
  ): Promise<ActionRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(account);
      
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are TheSalesSherpa, an expert B2B sales strategist. Analyze account data and provide specific, actionable recommendations for sales engagement. Focus on relationship-based selling, timing, and personalization. Output as JSON array of recommendations.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      const parsed = JSON.parse(content);
      const recommendations = parsed.recommendations || [];

      return recommendations.map((rec: any, index: number) => ({
        id: `ai-${account.id}-${index}`,
        priority: rec.priority || 'medium',
        action: rec.action,
        reason: rec.reason,
        suggestedMessage: rec.suggestedMessage,
        successProbability: rec.successProbability || 0.5,
        category: rec.category || 'outreach',
        deadline: rec.deadline ? new Date(rec.deadline) : undefined
      }));
    } catch (error) {
      console.error('[Intelligence] AI recommendation error:', error);
      return [];
    }
  }

  /**
   * Build prompt for AI recommendations
   */
  private buildRecommendationPrompt(account: AccountContext): string {
    return `
Analyze this B2B sales opportunity and provide strategic recommendations:

**Account: ${account.name}**
- Industry: ${account.industry || 'Unknown'}
- Urgency Score: ${account.urgencyScore}/100

**Key Contacts:**
${account.contacts.map(c => `
- ${c.name} (${c.title || 'Unknown title'})
  - Connection: ${c.separationDegree || 'Unknown'}° separation
  - Budget Influence: ${c.influence.budget}/100
  - Last Contacted: ${c.lastContacted || 'Never'}
`).join('')}

**Recent Signals:**
${account.recentAlerts.map(a => `
- [${a.urgency.toUpperCase()}] ${a.type}: ${a.message}
`).join('')}

**Relationship Paths:**
${account.relationships.map(r => `
- ${r.targetName} (${r.targetTitle}) - ${r.degrees}° via ${r.connectorName || 'direct'}
`).join('')}

Provide 2-3 specific, actionable recommendations in this JSON format:
{
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "Specific action to take",
      "reason": "Why this action matters now",
      "suggestedMessage": "Draft message if outreach",
      "successProbability": 0.7,
      "category": "outreach|followup|intro_request|relationship_building"
    }
  ]
}
    `.trim();
  }

  /**
   * Generate personalized outreach message
   */
  async generateOutreachMessage(
    context: {
      senderName: string;
      recipientName: string;
      recipientTitle?: string;
      recipientCompany: string;
      relationshipPath?: string;
      relevantNews?: string;
      purpose: string;
      channel: 'email' | 'linkedin' | 'intro_request';
    }
  ): Promise<OutreachTemplate> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert B2B sales copywriter. Write concise, personalized outreach messages that get responses. Focus on value, not features. Be human, not salesy. Keep it under 150 words for LinkedIn, 200 for email.`
          },
          {
            role: 'user',
            content: `
Write a ${context.channel} message:
- From: ${context.senderName}
- To: ${context.recipientName} (${context.recipientTitle || 'Executive'} at ${context.recipientCompany})
- Relationship: ${context.relationshipPath || 'Cold outreach'}
- Relevant context: ${context.relevantNews || 'None'}
- Purpose: ${context.purpose}

Return JSON: { "subject": "...", "body": "...", "personalization": ["item1", "item2"] }
            `
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);

      return {
        id: `template-${Date.now()}`,
        type: context.channel,
        subject: parsed.subject,
        body: parsed.body,
        personalization: parsed.personalization || [],
        expectedResponseRate: context.relationshipPath ? 0.25 : 0.05
      };
    } catch (error) {
      console.error('[Intelligence] Outreach generation error:', error);
      
      // Return fallback template
      return this.getFallbackTemplate(context);
    }
  }

  /**
   * Fallback outreach template
   */
  private getFallbackTemplate(context: {
    recipientName: string;
    recipientCompany: string;
    channel: string;
  }): OutreachTemplate {
    return {
      id: `fallback-${Date.now()}`,
      type: context.channel as any,
      subject: `Quick question for ${context.recipientCompany}`,
      body: `Hi ${context.recipientName},

I hope this message finds you well. I came across ${context.recipientCompany} and was impressed by what you're building.

I'd love to share some insights that might be valuable for your team. Would you be open to a brief conversation?

Best regards`,
      personalization: ['company research', 'industry context'],
      expectedResponseRate: 0.05
    };
  }

  /**
   * Analyze news article and extract sales signals
   */
  async analyzeNewsSignal(
    article: {
      headline: string;
      content: string;
      sourceUrl: string;
      publishedAt: Date;
      companyName: string;
    }
  ): Promise<NewsSignal> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a sales intelligence analyst. Analyze news articles to identify B2B sales opportunities. Classify signal types, assess urgency impact, and recommend actions. Output as JSON.`
          },
          {
            role: 'user',
            content: `
Analyze this news for sales opportunities:

Company: ${article.companyName}
Headline: ${article.headline}
Content: ${article.content.slice(0, 1500)}

Return JSON:
{
  "signalType": "funding|hiring|executive_change|expansion|acquisition|partnership|product_launch|earnings|layoffs|technology_adoption|competitor_mention|general_news",
  "urgencyImpact": 0-20,
  "analysis": "Why this matters for sales",
  "recommendedAction": "Specific action to take",
  "confidence": 0.0-1.0
}
            `
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(content);

      return {
        id: `signal-${Date.now()}`,
        companyName: article.companyName,
        headline: article.headline,
        summary: article.content.slice(0, 200) + '...',
        sourceUrl: article.sourceUrl,
        publishedAt: article.publishedAt,
        signalType: parsed.signalType || 'general_news',
        urgencyImpact: parsed.urgencyImpact || 0,
        aiAnalysis: parsed.analysis,
        recommendedAction: parsed.recommendedAction,
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('[Intelligence] News analysis error:', error);
      
      return {
        id: `signal-${Date.now()}`,
        companyName: article.companyName,
        headline: article.headline,
        summary: article.content.slice(0, 200) + '...',
        sourceUrl: article.sourceUrl,
        publishedAt: article.publishedAt,
        signalType: 'general_news',
        urgencyImpact: 5,
        confidence: 0.3
      };
    }
  }

  /**
   * Get dashboard intelligence summary
   */
  async getDashboardIntelligence(
    accounts: AccountContext[]
  ): Promise<DashboardIntelligence> {
    const highPriority = accounts.filter(a => a.urgencyScore >= 80);
    const avgScore = accounts.reduce((sum, a) => sum + a.urgencyScore, 0) / accounts.length;
    
    // Collect all alerts
    const allAlerts = accounts.flatMap(a => a.recentAlerts);
    
    // Generate top actions across all accounts
    const allActions: ActionRecommendation[] = [];
    for (const account of highPriority.slice(0, 5)) {
      const actions = await this.generateActionRecommendations(account);
      allActions.push(...actions.slice(0, 3));
    }

    // Sort and dedupe actions
    const topActions = allActions
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5);

    // Recent activities summary
    const recentActivities = accounts
      .flatMap(a => a.recentActivities)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(activity => ({
        message: `${activity.type}: ${activity.subject || 'Activity recorded'}`,
        type: 'activity' as const,
        timestamp: activity.date
      }));

    // Add alerts to activities
    const alertActivities = allAlerts
      .slice(0, 5)
      .map(alert => ({
        message: alert.message,
        type: 'alert' as const,
        timestamp: alert.createdAt
      }));

    return {
      totalAccounts: accounts.length,
      highPriorityAccounts: highPriority.length,
      totalAlerts: allAlerts.length,
      averageUrgencyScore: Math.round(avgScore),
      topActions: topActions.map(a => ({
        ...a,
        account: accounts.find(acc => a.id.includes(acc.id))?.name || 'Unknown'
      })) as any,
      recentActivities: [...recentActivities, ...alertActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8),
      weeklyStats: {
        newOpportunities: Math.floor(highPriority.length * 0.3),
        completedActivities: accounts.reduce((sum, a) => sum + a.recentActivities.length, 0),
        introductionsRequested: Math.floor(accounts.length * 0.1),
        responseRate: 0.73  // Example - would be calculated from real data
      }
    };
  }

  /**
   * Generate weekly digest summary
   */
  async generateWeeklyDigest(
    accounts: AccountContext[],
    userName: string
  ): Promise<string> {
    const intel = await this.getDashboardIntelligence(accounts);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are TheSalesSherpa, providing a concise weekly sales intelligence digest. Be encouraging but data-driven. Keep it under 300 words.`
          },
          {
            role: 'user',
            content: `
Generate a weekly digest for ${userName}:

Stats:
- Total Accounts: ${intel.totalAccounts}
- High Priority: ${intel.highPriorityAccounts}
- Active Alerts: ${intel.totalAlerts}
- Avg Urgency Score: ${intel.averageUrgencyScore}
- Response Rate: ${Math.round(intel.weeklyStats.responseRate * 100)}%

Top Actions:
${intel.topActions.map(a => `- ${a.action}`).join('\n')}

Write a motivating summary with 2-3 key priorities for the week.
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      });

      return response.choices[0]?.message?.content || 'Unable to generate digest.';
    } catch (error) {
      console.error('[Intelligence] Digest generation error:', error);
      return `Weekly Summary for ${userName}: ${intel.highPriorityAccounts} high-priority accounts need attention. Focus on your top ${intel.topActions.length} actions this week.`;
    }
  }
}

/**
 * Create intelligence service instance
 */
export function createIntelligenceService(config: IntelligenceConfig): IntelligenceService {
  return new IntelligenceService(config);
}

export default IntelligenceService;
