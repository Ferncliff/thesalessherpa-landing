/**
 * TheSalesSherpa Urgency Scoring Engine
 *
 * Advanced multi-factor scoring algorithm that determines
 * account priority based on timing, signals, relationships,
 * engagement, fit, and competitive intelligence.
 *
 * Score Range: 0-100
 *
 * Weight Distribution:
 *   - Timing Signals:      25%
 *   - Company Signals:     20%
 *   - Relationship Score:  20%
 *   - Engagement Signals:  15%
 *   - Fit Score:          10%
 *   - Competitive Intel:  10%
 */
export interface Account {
    id: string;
    name: string;
    industry: string;
    companySize: string;
    employeeCount?: number;
    annualRevenue?: number;
    fiscalYearEnd?: string;
    lastActivityAt?: Date;
    contacts?: Contact[];
    alerts?: Alert[];
    activities?: Activity[];
    customFields?: Record<string, any>;
}
export interface Contact {
    id: string;
    separationDegree?: number;
    connectionStrength?: number;
    lastContactedAt?: Date;
    lastResponseAt?: Date;
    influence: InfluenceScore;
}
export interface InfluenceScore {
    budget: number;
    technical: number;
    relationship: number;
    urgency: number;
}
export interface Alert {
    id: string;
    type: AlertType;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    createdAt: Date;
    metadata?: Record<string, any>;
}
export interface Activity {
    id: string;
    type: string;
    createdAt: Date;
    outcome?: string;
}
export type AlertType = 'funding' | 'hiring' | 'executive_change' | 'expansion' | 'contract' | 'earnings' | 'product_launch' | 'partnership' | 'competitor_mention' | 'technology_adoption' | 'news';
export interface ScoringBreakdown {
    overall: number;
    timing: TimingScore;
    company: CompanySignalScore;
    relationship: RelationshipScore;
    engagement: EngagementScore;
    fit: FitScore;
    competitive: CompetitiveScore;
    factors: ScoringFactor[];
}
export interface TimingScore {
    score: number;
    maxScore: number;
    factors: ScoringFactor[];
}
export interface CompanySignalScore {
    score: number;
    maxScore: number;
    factors: ScoringFactor[];
}
export interface RelationshipScore {
    score: number;
    maxScore: number;
    factors: ScoringFactor[];
}
export interface EngagementScore {
    score: number;
    maxScore: number;
    factors: ScoringFactor[];
}
export interface FitScore {
    score: number;
    maxScore: number;
    factors: ScoringFactor[];
}
export interface CompetitiveScore {
    score: number;
    maxScore: number;
    factors: ScoringFactor[];
}
export interface ScoringFactor {
    name: string;
    points: number;
    maxPoints: number;
    description: string;
    category: 'timing' | 'company' | 'relationship' | 'engagement' | 'fit' | 'competitive';
}
export interface ICPProfile {
    targetIndustries: string[];
    minEmployees: number;
    maxEmployees: number;
    minRevenue: number;
    maxRevenue: number;
    targetTitles: string[];
    targetTechnologies: string[];
}
/**
 * Main scoring function - calculates comprehensive urgency score
 */
export declare function calculateUrgencyScore(account: Account, icpProfile?: ICPProfile, currentDate?: Date): ScoringBreakdown;
/**
 * Get priority level from urgency score
 */
export declare function getPriorityLevel(urgencyScore: number): {
    level: 'critical' | 'high' | 'medium' | 'low' | 'none';
    color: string;
    label: string;
};
/**
 * Batch recalculate scores for multiple accounts
 */
export declare function batchRecalculateScores(accounts: Account[], icpProfile?: ICPProfile): Promise<Map<string, ScoringBreakdown>>;
declare const _default: {
    calculateUrgencyScore: typeof calculateUrgencyScore;
    getPriorityLevel: typeof getPriorityLevel;
    batchRecalculateScores: typeof batchRecalculateScores;
};
export default _default;
//# sourceMappingURL=urgencyScoring.d.ts.map