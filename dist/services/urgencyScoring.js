"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUrgencyScore = calculateUrgencyScore;
exports.getPriorityLevel = getPriorityLevel;
exports.batchRecalculateScores = batchRecalculateScores;
const WEIGHTS = {
    timing: 0.25,
    company: 0.20,
    relationship: 0.20,
    engagement: 0.15,
    fit: 0.10,
    competitive: 0.10
};
/**
 * Main scoring function - calculates comprehensive urgency score
 */
function calculateUrgencyScore(account, icpProfile, currentDate = new Date()) {
    const timingScore = calculateTimingScore(account, currentDate);
    const companyScore = calculateCompanySignalScore(account);
    const relationshipScore = calculateRelationshipScore(account);
    const engagementScore = calculateEngagementScore(account, currentDate);
    const fitScore = calculateFitScore(account, icpProfile);
    const competitiveScore = calculateCompetitiveScore(account);
    // Calculate weighted overall score
    const overall = Math.round((timingScore.score / timingScore.maxScore * 100 * WEIGHTS.timing) +
        (companyScore.score / companyScore.maxScore * 100 * WEIGHTS.company) +
        (relationshipScore.score / relationshipScore.maxScore * 100 * WEIGHTS.relationship) +
        (engagementScore.score / engagementScore.maxScore * 100 * WEIGHTS.engagement) +
        (fitScore.score / fitScore.maxScore * 100 * WEIGHTS.fit) +
        (competitiveScore.score / competitiveScore.maxScore * 100 * WEIGHTS.competitive));
    // Collect all factors for detailed breakdown
    const allFactors = [
        ...timingScore.factors,
        ...companyScore.factors,
        ...relationshipScore.factors,
        ...engagementScore.factors,
        ...fitScore.factors,
        ...competitiveScore.factors
    ];
    return {
        overall: Math.min(100, Math.max(0, overall)),
        timing: timingScore,
        company: companyScore,
        relationship: relationshipScore,
        engagement: engagementScore,
        fit: fitScore,
        competitive: competitiveScore,
        factors: allFactors.sort((a, b) => b.points - a.points)
    };
}
/**
 * Timing Signals (25% weight)
 * - End of quarter proximity
 * - Budget cycle awareness
 * - Fiscal year planning
 * - Contract renewal dates
 */
function calculateTimingScore(account, currentDate) {
    const factors = [];
    let totalScore = 0;
    const maxScore = 100;
    // Quarter-end proximity (up to 20 points)
    const month = currentDate.getMonth();
    const quarterEndMonths = [2, 5, 8, 11]; // March, June, Sept, Dec
    const closestQuarterEnd = quarterEndMonths.reduce((closest, qe) => Math.abs(qe - month) < Math.abs(closest - month) ? qe : closest);
    const monthsToQuarterEnd = Math.abs(closestQuarterEnd - month);
    if (monthsToQuarterEnd <= 1) {
        const points = 20;
        totalScore += points;
        factors.push({
            name: 'Quarter-End Proximity',
            points,
            maxPoints: 20,
            description: 'Within 1 month of quarter end - prime budget spending time',
            category: 'timing'
        });
    }
    else if (monthsToQuarterEnd <= 2) {
        const points = 12;
        totalScore += points;
        factors.push({
            name: 'Approaching Quarter-End',
            points,
            maxPoints: 20,
            description: 'Within 2 months of quarter end',
            category: 'timing'
        });
    }
    // Fiscal year alignment (up to 15 points)
    if (account.fiscalYearEnd) {
        const fyeMonth = parseInt(account.fiscalYearEnd.split('-')[1]) - 1;
        const monthsToFYE = (fyeMonth - month + 12) % 12;
        if (monthsToFYE <= 2) {
            const points = 15;
            totalScore += points;
            factors.push({
                name: 'Fiscal Year Budget Flush',
                points,
                maxPoints: 15,
                description: 'Within 2 months of fiscal year end - use-it-or-lose-it budget',
                category: 'timing'
            });
        }
        else if (monthsToFYE >= 10) {
            const points = 12;
            totalScore += points;
            factors.push({
                name: 'New Fiscal Year Planning',
                points,
                maxPoints: 15,
                description: 'Early in fiscal year - new budget allocation phase',
                category: 'timing'
            });
        }
    }
    // Q1 January planning boost (up to 15 points)
    if (month === 0 || month === 1) {
        const points = 15;
        totalScore += points;
        factors.push({
            name: 'Q1 Planning Season',
            points,
            maxPoints: 15,
            description: 'January-February strategic planning period',
            category: 'timing'
        });
    }
    // Contract renewal signals from alerts (up to 20 points)
    const contractAlerts = account.alerts?.filter(a => a.type === 'contract') || [];
    if (contractAlerts.length > 0) {
        const points = 20;
        totalScore += points;
        factors.push({
            name: 'Contract Renewal Detected',
            points,
            maxPoints: 20,
            description: 'Active contract renewal signal - decision window open',
            category: 'timing'
        });
    }
    // Technology/budget cycle from recent news (up to 15 points)
    const budgetNews = account.alerts?.filter(a => a.type === 'news' && a.metadata?.keywords?.includes('budget')) || [];
    if (budgetNews.length > 0) {
        const points = 15;
        totalScore += points;
        factors.push({
            name: 'Budget Cycle News',
            points,
            maxPoints: 15,
            description: 'Recent news mentions budget or spending initiatives',
            category: 'timing'
        });
    }
    // Recent high-urgency alerts boost (up to 15 points)
    const recentHighUrgency = account.alerts?.filter(a => a.urgency === 'critical' || a.urgency === 'high').filter(a => {
        const alertAge = (currentDate.getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return alertAge <= 14; // Within 2 weeks
    }) || [];
    if (recentHighUrgency.length > 0) {
        const points = Math.min(15, recentHighUrgency.length * 5);
        totalScore += points;
        factors.push({
            name: 'Recent High-Urgency Signals',
            points,
            maxPoints: 15,
            description: `${recentHighUrgency.length} high-urgency alert(s) in past 2 weeks`,
            category: 'timing'
        });
    }
    return {
        score: Math.min(totalScore, maxScore),
        maxScore,
        factors
    };
}
/**
 * Company Signals (20% weight)
 * - Funding rounds
 * - Executive hiring
 * - Expansion news
 * - Technology initiatives
 */
function calculateCompanySignalScore(account) {
    const factors = [];
    let totalScore = 0;
    const maxScore = 100;
    const alerts = account.alerts || [];
    // Funding signals (up to 25 points)
    const fundingAlerts = alerts.filter(a => a.type === 'funding');
    if (fundingAlerts.length > 0) {
        const mostRecent = fundingAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        const points = mostRecent.urgency === 'critical' ? 25 :
            mostRecent.urgency === 'high' ? 20 : 15;
        totalScore += points;
        factors.push({
            name: 'Recent Funding',
            points,
            maxPoints: 25,
            description: 'Company received funding - budget likely increasing',
            category: 'company'
        });
    }
    // Executive hiring signals (up to 20 points)
    const executiveAlerts = alerts.filter(a => a.type === 'executive_change');
    if (executiveAlerts.length > 0) {
        const points = 20;
        totalScore += points;
        factors.push({
            name: 'Executive Change',
            points,
            maxPoints: 20,
            description: 'New executive hire - potential new initiatives',
            category: 'company'
        });
    }
    // Hiring spree signals (up to 15 points)
    const hiringAlerts = alerts.filter(a => a.type === 'hiring');
    if (hiringAlerts.length >= 3) {
        const points = 15;
        totalScore += points;
        factors.push({
            name: 'Hiring Spree',
            points,
            maxPoints: 15,
            description: 'Multiple job postings detected - growth phase',
            category: 'company'
        });
    }
    else if (hiringAlerts.length > 0) {
        const points = 8;
        totalScore += points;
        factors.push({
            name: 'Active Hiring',
            points,
            maxPoints: 15,
            description: 'Active job postings detected',
            category: 'company'
        });
    }
    // Expansion news (up to 15 points)
    const expansionAlerts = alerts.filter(a => a.type === 'expansion');
    if (expansionAlerts.length > 0) {
        const points = 15;
        totalScore += points;
        factors.push({
            name: 'Expansion Initiative',
            points,
            maxPoints: 15,
            description: 'Company expanding operations or markets',
            category: 'company'
        });
    }
    // Technology adoption (up to 15 points)
    const techAlerts = alerts.filter(a => a.type === 'technology_adoption');
    if (techAlerts.length > 0) {
        const points = 15;
        totalScore += points;
        factors.push({
            name: 'Technology Initiative',
            points,
            maxPoints: 15,
            description: 'New technology adoption signals - potential need',
            category: 'company'
        });
    }
    // Partnership announcements (up to 10 points)
    const partnershipAlerts = alerts.filter(a => a.type === 'partnership');
    if (partnershipAlerts.length > 0) {
        const points = 10;
        totalScore += points;
        factors.push({
            name: 'Partnership Activity',
            points,
            maxPoints: 10,
            description: 'New partnership announced - ecosystem growth',
            category: 'company'
        });
    }
    return {
        score: Math.min(totalScore, maxScore),
        maxScore,
        factors
    };
}
/**
 * Relationship Score (20% weight)
 * - Connection strength
 * - Separation degrees
 * - Mutual connections
 */
function calculateRelationshipScore(account) {
    const factors = [];
    let totalScore = 0;
    const maxScore = 100;
    const contacts = account.contacts || [];
    if (contacts.length === 0) {
        factors.push({
            name: 'No Mapped Contacts',
            points: 0,
            maxPoints: 100,
            description: 'No contacts with relationship data - needs research',
            category: 'relationship'
        });
        return { score: 0, maxScore, factors };
    }
    // Find best connection (lowest separation degree)
    const bestConnection = contacts
        .filter(c => c.separationDegree !== undefined)
        .sort((a, b) => (a.separationDegree || 99) - (b.separationDegree || 99))[0];
    if (bestConnection) {
        const degree = bestConnection.separationDegree || 99;
        // 1st degree = 40 points, 2nd = 30, 3rd = 20, 4th = 10, 5+ = 5
        const degreePoints = degree === 1 ? 40 :
            degree === 2 ? 30 :
                degree === 3 ? 20 :
                    degree === 4 ? 10 : 5;
        totalScore += degreePoints;
        factors.push({
            name: `${degree}° Separation`,
            points: degreePoints,
            maxPoints: 40,
            description: degree === 1 ? 'Direct connection - intro ready!' :
                degree === 2 ? 'One introduction away' :
                    `${degree} hops to best contact`,
            category: 'relationship'
        });
        // Connection strength bonus (up to 20 points)
        if (bestConnection.connectionStrength) {
            const strengthPoints = Math.round(bestConnection.connectionStrength * 20);
            totalScore += strengthPoints;
            factors.push({
                name: 'Connection Strength',
                points: strengthPoints,
                maxPoints: 20,
                description: `${Math.round(bestConnection.connectionStrength * 100)}% connection confidence`,
                category: 'relationship'
            });
        }
    }
    // Decision maker access (up to 25 points)
    const decisionMakers = contacts.filter(c => c.influence.budget >= 70 || c.influence.urgency >= 70);
    if (decisionMakers.length > 0) {
        const bestDM = decisionMakers.sort((a, b) => (b.influence.budget + b.influence.urgency) - (a.influence.budget + a.influence.urgency))[0];
        const dmPoints = Math.round((bestDM.influence.budget + bestDM.influence.urgency) / 8);
        totalScore += dmPoints;
        factors.push({
            name: 'Decision Maker Access',
            points: dmPoints,
            maxPoints: 25,
            description: 'Connected to key decision maker with budget authority',
            category: 'relationship'
        });
    }
    // Multiple contact paths (up to 15 points)
    const connectedContacts = contacts.filter(c => c.separationDegree && c.separationDegree <= 4);
    if (connectedContacts.length >= 3) {
        const points = 15;
        totalScore += points;
        factors.push({
            name: 'Multiple Entry Points',
            points,
            maxPoints: 15,
            description: `${connectedContacts.length} warm connection paths available`,
            category: 'relationship'
        });
    }
    else if (connectedContacts.length >= 2) {
        const points = 8;
        totalScore += points;
        factors.push({
            name: 'Multiple Contacts',
            points,
            maxPoints: 15,
            description: `${connectedContacts.length} connected contacts`,
            category: 'relationship'
        });
    }
    return {
        score: Math.min(totalScore, maxScore),
        maxScore,
        factors
    };
}
/**
 * Engagement Score (15% weight)
 * - Recent activity
 * - Response rates
 * - Meeting completion
 */
function calculateEngagementScore(account, currentDate) {
    const factors = [];
    let totalScore = 0;
    const maxScore = 100;
    const activities = account.activities || [];
    const contacts = account.contacts || [];
    // Recent activity (up to 30 points)
    if (account.lastActivityAt) {
        const daysSinceActivity = Math.floor((currentDate.getTime() - new Date(account.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceActivity <= 7) {
            totalScore += 30;
            factors.push({
                name: 'Active Engagement',
                points: 30,
                maxPoints: 30,
                description: 'Recent activity within past week',
                category: 'engagement'
            });
        }
        else if (daysSinceActivity <= 30) {
            totalScore += 20;
            factors.push({
                name: 'Recent Engagement',
                points: 20,
                maxPoints: 30,
                description: 'Activity within past month',
                category: 'engagement'
            });
        }
        else if (daysSinceActivity <= 90) {
            totalScore += 10;
            factors.push({
                name: 'Moderate Engagement',
                points: 10,
                maxPoints: 30,
                description: 'Activity within past quarter',
                category: 'engagement'
            });
        }
        else {
            factors.push({
                name: 'Stale Account',
                points: 0,
                maxPoints: 30,
                description: `No activity in ${daysSinceActivity} days - needs re-engagement`,
                category: 'engagement'
            });
        }
    }
    // Response signals (up to 25 points)
    const respondingContacts = contacts.filter(c => c.lastResponseAt);
    if (respondingContacts.length > 0) {
        const recentResponses = respondingContacts.filter(c => {
            const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastResponseAt).getTime()) / (1000 * 60 * 60 * 24));
            return daysSince <= 30;
        });
        if (recentResponses.length > 0) {
            const points = Math.min(25, recentResponses.length * 10);
            totalScore += points;
            factors.push({
                name: 'Contact Responsiveness',
                points,
                maxPoints: 25,
                description: `${recentResponses.length} contact(s) responded recently`,
                category: 'engagement'
            });
        }
    }
    // Meeting/call activity (up to 25 points)
    const meetingActivities = activities.filter(a => a.type.includes('meeting') || a.type.includes('call'));
    const recentMeetings = meetingActivities.filter(a => {
        const daysSince = Math.floor((currentDate.getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince <= 60;
    });
    if (recentMeetings.length > 0) {
        const points = Math.min(25, recentMeetings.length * 8);
        totalScore += points;
        factors.push({
            name: 'Meeting Activity',
            points,
            maxPoints: 25,
            description: `${recentMeetings.length} meeting(s)/call(s) in past 60 days`,
            category: 'engagement'
        });
    }
    // Email engagement (up to 20 points)
    const emailActivities = activities.filter(a => a.type.includes('email'));
    const positiveEmails = emailActivities.filter(a => a.outcome === 'replied' || a.outcome === 'opened');
    if (positiveEmails.length > 0) {
        const engagementRate = positiveEmails.length / Math.max(1, emailActivities.length);
        const points = Math.round(engagementRate * 20);
        totalScore += points;
        factors.push({
            name: 'Email Engagement',
            points,
            maxPoints: 20,
            description: `${Math.round(engagementRate * 100)}% email engagement rate`,
            category: 'engagement'
        });
    }
    return {
        score: Math.min(totalScore, maxScore),
        maxScore,
        factors
    };
}
/**
 * Fit Score (10% weight)
 * - ICP alignment
 * - Industry match
 * - Size compatibility
 */
function calculateFitScore(account, icpProfile) {
    const factors = [];
    let totalScore = 0;
    const maxScore = 100;
    if (!icpProfile) {
        // Default fit assessment without ICP
        totalScore = 50;
        factors.push({
            name: 'No ICP Defined',
            points: 50,
            maxPoints: 100,
            description: 'No Ideal Customer Profile defined - using default scoring',
            category: 'fit'
        });
        return { score: totalScore, maxScore, factors };
    }
    // Industry match (up to 30 points)
    if (icpProfile.targetIndustries.length > 0) {
        const industryMatch = icpProfile.targetIndustries.some(i => account.industry?.toLowerCase().includes(i.toLowerCase()));
        if (industryMatch) {
            totalScore += 30;
            factors.push({
                name: 'Industry Match',
                points: 30,
                maxPoints: 30,
                description: `${account.industry} matches ICP`,
                category: 'fit'
            });
        }
    }
    // Company size match (up to 30 points)
    if (account.employeeCount) {
        const sizeMatch = account.employeeCount >= icpProfile.minEmployees &&
            account.employeeCount <= icpProfile.maxEmployees;
        if (sizeMatch) {
            totalScore += 30;
            factors.push({
                name: 'Size Match',
                points: 30,
                maxPoints: 30,
                description: `${account.employeeCount} employees fits ICP range`,
                category: 'fit'
            });
        }
        else {
            // Partial credit if close
            const distanceFromRange = Math.min(Math.abs(account.employeeCount - icpProfile.minEmployees), Math.abs(account.employeeCount - icpProfile.maxEmployees));
            const percentageOff = distanceFromRange / Math.max(icpProfile.maxEmployees, 1);
            const partialPoints = Math.max(0, Math.round(30 * (1 - percentageOff)));
            if (partialPoints > 0) {
                totalScore += partialPoints;
                factors.push({
                    name: 'Near Size Match',
                    points: partialPoints,
                    maxPoints: 30,
                    description: `${account.employeeCount} employees near ICP range`,
                    category: 'fit'
                });
            }
        }
    }
    // Revenue match (up to 25 points)
    if (account.annualRevenue) {
        const revenueMatch = account.annualRevenue >= icpProfile.minRevenue &&
            account.annualRevenue <= icpProfile.maxRevenue;
        if (revenueMatch) {
            totalScore += 25;
            factors.push({
                name: 'Revenue Match',
                points: 25,
                maxPoints: 25,
                description: `Revenue within ICP range`,
                category: 'fit'
            });
        }
    }
    // Decision maker access (up to 15 points)
    const contacts = account.contacts || [];
    const titleMatches = contacts.filter(c => {
        // This would check against icpProfile.targetTitles
        return icpProfile.targetTitles.some(t => c.influence.budget >= 60 || c.influence.technical >= 60);
    });
    if (titleMatches.length > 0) {
        totalScore += 15;
        factors.push({
            name: 'Decision Maker Present',
            points: 15,
            maxPoints: 15,
            description: `${titleMatches.length} ICP-matching decision maker(s)`,
            category: 'fit'
        });
    }
    return {
        score: Math.min(totalScore, maxScore),
        maxScore,
        factors
    };
}
/**
 * Competitive Intelligence (10% weight)
 * - Using competitor
 * - Competitive RFP
 * - Dissatisfaction signals
 */
function calculateCompetitiveScore(account) {
    const factors = [];
    let totalScore = 0;
    const maxScore = 100;
    const alerts = account.alerts || [];
    // Competitor mentions (up to 30 points)
    const competitorAlerts = alerts.filter(a => a.type === 'competitor_mention');
    if (competitorAlerts.length > 0) {
        const urgentCompetitor = competitorAlerts.some(a => a.urgency === 'critical' || a.urgency === 'high');
        const points = urgentCompetitor ? 30 : 20;
        totalScore += points;
        factors.push({
            name: 'Competitive Activity',
            points,
            maxPoints: 30,
            description: urgentCompetitor ?
                'Active competitor engagement detected - urgent' :
                'Competitor mentioned in recent signals',
            category: 'competitive'
        });
    }
    // Technology signals that indicate competitor usage (up to 25 points)
    const techAlerts = alerts.filter(a => a.type === 'technology_adoption' &&
        a.metadata?.isCompetitor === true);
    if (techAlerts.length > 0) {
        totalScore += 25;
        factors.push({
            name: 'Using Competitor Solution',
            points: 25,
            maxPoints: 25,
            description: 'Currently using competitor - displacement opportunity',
            category: 'competitive'
        });
    }
    // RFP/evaluation signals (up to 25 points)
    const evaluationSignals = alerts.filter(a => a.metadata?.isEvaluation === true ||
        a.metadata?.keywords?.includes('rfp') ||
        a.metadata?.keywords?.includes('evaluation'));
    if (evaluationSignals.length > 0) {
        totalScore += 25;
        factors.push({
            name: 'Active Evaluation',
            points: 25,
            maxPoints: 25,
            description: 'RFP or vendor evaluation in progress',
            category: 'competitive'
        });
    }
    // Dissatisfaction signals (up to 20 points)
    const dissatisfactionSignals = alerts.filter(a => a.metadata?.sentiment === 'negative' ||
        a.metadata?.keywords?.some((k) => ['frustrated', 'disappointed', 'switching', 'alternatives'].includes(k.toLowerCase())));
    if (dissatisfactionSignals.length > 0) {
        totalScore += 20;
        factors.push({
            name: 'Dissatisfaction Signals',
            points: 20,
            maxPoints: 20,
            description: 'Signs of dissatisfaction with current solution',
            category: 'competitive'
        });
    }
    return {
        score: Math.min(totalScore, maxScore),
        maxScore,
        factors
    };
}
/**
 * Get priority level from urgency score
 */
function getPriorityLevel(urgencyScore) {
    if (urgencyScore >= 90) {
        return { level: 'critical', color: 'red', label: 'HOT' };
    }
    else if (urgencyScore >= 75) {
        return { level: 'high', color: 'orange', label: 'WARM' };
    }
    else if (urgencyScore >= 60) {
        return { level: 'medium', color: 'yellow', label: 'DEVELOPING' };
    }
    else if (urgencyScore >= 40) {
        return { level: 'low', color: 'green', label: 'NURTURE' };
    }
    else {
        return { level: 'none', color: 'gray', label: 'COLD' };
    }
}
/**
 * Batch recalculate scores for multiple accounts
 */
async function batchRecalculateScores(accounts, icpProfile) {
    const results = new Map();
    const currentDate = new Date();
    for (const account of accounts) {
        const breakdown = calculateUrgencyScore(account, icpProfile, currentDate);
        results.set(account.id, breakdown);
    }
    return results;
}
exports.default = {
    calculateUrgencyScore,
    getPriorityLevel,
    batchRecalculateScores
};
//# sourceMappingURL=urgencyScoring.js.map