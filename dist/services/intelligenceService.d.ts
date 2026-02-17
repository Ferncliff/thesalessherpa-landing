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
export type SignalType = 'funding' | 'hiring' | 'executive_change' | 'expansion' | 'acquisition' | 'partnership' | 'product_launch' | 'earnings' | 'layoffs' | 'technology_adoption' | 'competitor_mention' | 'general_news';
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
export declare class IntelligenceService {
    private openai;
    private config;
    constructor(config: IntelligenceConfig);
    /**
     * Generate AI-powered action recommendations for an account
     */
    generateActionRecommendations(account: AccountContext): Promise<ActionRecommendation[]>;
    /**
     * Analyze relationship opportunities
     */
    private analyzeRelationshipOpportunities;
    /**
     * Analyze timing-based opportunities
     */
    private analyzeTimingOpportunities;
    /**
     * Analyze alert-based opportunities
     */
    private analyzeAlertOpportunities;
    /**
     * Get AI-powered recommendations using GPT-4
     */
    private getAIRecommendations;
    /**
     * Build prompt for AI recommendations
     */
    private buildRecommendationPrompt;
    /**
     * Generate personalized outreach message
     */
    generateOutreachMessage(context: {
        senderName: string;
        recipientName: string;
        recipientTitle?: string;
        recipientCompany: string;
        relationshipPath?: string;
        relevantNews?: string;
        purpose: string;
        channel: 'email' | 'linkedin' | 'intro_request';
    }): Promise<OutreachTemplate>;
    /**
     * Fallback outreach template
     */
    private getFallbackTemplate;
    /**
     * Analyze news article and extract sales signals
     */
    analyzeNewsSignal(article: {
        headline: string;
        content: string;
        sourceUrl: string;
        publishedAt: Date;
        companyName: string;
    }): Promise<NewsSignal>;
    /**
     * Get dashboard intelligence summary
     */
    getDashboardIntelligence(accounts: AccountContext[]): Promise<DashboardIntelligence>;
    /**
     * Generate weekly digest summary
     */
    generateWeeklyDigest(accounts: AccountContext[], userName: string): Promise<string>;
}
/**
 * Create intelligence service instance
 */
export declare function createIntelligenceService(config: IntelligenceConfig): IntelligenceService;
export default IntelligenceService;
//# sourceMappingURL=intelligenceService.d.ts.map