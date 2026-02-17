"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipMappingService = exports.relationshipMappingService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class RelationshipMappingService {
    connections = [];
    accounts = [];
    constructor() {
        this.loadData();
    }
    loadData() {
        try {
            // Load LinkedIn connections
            const connectionsPath = path_1.default.join(process.cwd(), 'data/connections/matt_linkedin_connections.json');
            if (fs_1.default.existsSync(connectionsPath)) {
                const connectionsData = JSON.parse(fs_1.default.readFileSync(connectionsPath, 'utf8'));
                this.connections = connectionsData.connections || [];
            }
            // Load FA accounts
            const accountsPath = path_1.default.join(process.cwd(), 'data/accounts/matt_fa_accounts_formatted.json');
            if (fs_1.default.existsSync(accountsPath)) {
                const accountsData = JSON.parse(fs_1.default.readFileSync(accountsPath, 'utf8'));
                this.accounts = accountsData.accounts || [];
            }
        }
        catch (error) {
            console.error('Error loading relationship data:', error);
        }
    }
    findWarmIntroPaths() {
        const warmPaths = [];
        for (const account of this.accounts) {
            for (const connection of this.connections) {
                const matchScore = this.calculateMatchScore(account, connection);
                if (matchScore.score > 0.3) { // Only show meaningful matches
                    const warmIntro = {
                        accountId: account.id,
                        accountName: account.name,
                        connectionId: connection.id,
                        connectionName: connection.fullName,
                        connectionTitle: connection.title,
                        connectionCompany: connection.company,
                        pathType: matchScore.pathType,
                        confidenceScore: matchScore.score,
                        relationshipStrength: connection.relationshipStrength,
                        introductionMessage: this.generateIntroductionMessage(account, connection, matchScore),
                        expectedSuccessRate: this.calculateSuccessRate(connection, matchScore),
                        reasoning: matchScore.reasoning,
                        urgencyScore: account.urgencyScore || 65,
                        priority: this.determinePriority(matchScore.score, account.urgencyScore || 65),
                        recommendedAction: this.generateRecommendedAction(account, connection, matchScore),
                        timeline: this.generateTimeline(matchScore.score, connection.relationshipStrength)
                    };
                    warmPaths.push(warmIntro);
                }
            }
        }
        // Sort by confidence score and urgency
        return warmPaths.sort((a, b) => {
            const aTotal = (a.confidenceScore * 0.6) + (a.urgencyScore * 0.4);
            const bTotal = (b.confidenceScore * 0.6) + (b.urgencyScore * 0.4);
            return bTotal - aTotal;
        });
    }
    calculateMatchScore(account, connection) {
        let score = 0;
        let pathType = 'mutual';
        let reasoning = '';
        // Direct company match (highest score)
        if (connection.company.toLowerCase() === account.name.toLowerCase()) {
            score = 0.95;
            pathType = 'direct';
            reasoning = `Direct contact at ${account.name}`;
            return { score, pathType, reasoning };
        }
        // Industry match
        const industryMatch = this.checkIndustryMatch(account.industry, connection.industry);
        if (industryMatch.match) {
            score += industryMatch.score;
            pathType = 'industry';
            reasoning += industryMatch.reasoning + '; ';
        }
        // Location proximity
        const locationMatch = this.checkLocationMatch(account.location, connection.location);
        if (locationMatch.match) {
            score += locationMatch.score;
            reasoning += locationMatch.reasoning + '; ';
        }
        // Relationship strength bonus
        const relationshipBonus = {
            'strong': 0.3,
            'warm': 0.2,
            'medium': 0.1,
            'weak': 0.05
        };
        score += relationshipBonus[connection.relationshipStrength] || 0;
        reasoning += `${connection.relationshipStrength} relationship`;
        // Recent interaction bonus
        const recentInteraction = this.hasRecentInteraction(connection);
        if (recentInteraction) {
            score += 0.15;
            reasoning += '; recent LinkedIn activity';
        }
        // Mutual connections bonus
        if (connection.mutualConnections > 10) {
            score += 0.1;
            reasoning += `; ${connection.mutualConnections} mutual connections`;
        }
        return { score: Math.min(score, 1.0), pathType, reasoning: reasoning.trim() };
    }
    checkIndustryMatch(accountIndustry, connectionIndustry) {
        if (!accountIndustry || !connectionIndustry) {
            return { match: false, score: 0, reasoning: '' };
        }
        const accountInd = accountIndustry.toLowerCase();
        const connectionInd = connectionIndustry.toLowerCase();
        // Exact industry match
        if (accountInd === connectionInd) {
            return { match: true, score: 0.4, reasoning: `Same industry (${connectionIndustry})` };
        }
        // Related industries
        const industryRelations = {
            'financial services': ['banking', 'finance', 'investment', 'insurance'],
            'aerospace & defense': ['defense', 'aerospace', 'military', 'government'],
            'technology': ['software', 'tech', 'it', 'saas'],
            'government services': ['government', 'public sector', 'federal'],
            'healthcare': ['medical', 'health', 'pharmaceutical', 'biotech']
        };
        for (const [mainIndustry, related] of Object.entries(industryRelations)) {
            if (accountInd.includes(mainIndustry) || related.some(r => accountInd.includes(r))) {
                if (connectionInd.includes(mainIndustry) || related.some(r => connectionInd.includes(r))) {
                    return { match: true, score: 0.25, reasoning: `Related industry (${connectionIndustry})` };
                }
            }
        }
        return { match: false, score: 0, reasoning: '' };
    }
    checkLocationMatch(accountLocation, connectionLocation) {
        if (!accountLocation || !connectionLocation) {
            return { match: false, score: 0, reasoning: '' };
        }
        const accLoc = accountLocation.toLowerCase();
        const connLoc = connectionLocation.toLowerCase();
        // Same city
        if (accLoc === connLoc) {
            return { match: true, score: 0.2, reasoning: `Same location (${connectionLocation})` };
        }
        // Same state
        const accState = accLoc.split(',').pop()?.trim();
        const connState = connLoc.split(',').pop()?.trim();
        if (accState && connState && accState === connState) {
            return { match: true, score: 0.1, reasoning: `Same state (${connState?.toUpperCase()})` };
        }
        return { match: false, score: 0, reasoning: '' };
    }
    hasRecentInteraction(connection) {
        if (!connection.interactionHistory || connection.interactionHistory.length === 0) {
            return false;
        }
        const lastInteraction = new Date(connection.interactionHistory[0].date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return lastInteraction > sixMonthsAgo;
    }
    calculateSuccessRate(connection, matchScore) {
        let baseRate = 0.3; // Base 30% success rate for cold intro
        // Relationship strength multiplier
        const strengthMultiplier = {
            'strong': 2.0,
            'warm': 1.5,
            'medium': 1.2,
            'weak': 1.0
        };
        baseRate *= strengthMultiplier[connection.relationshipStrength] || 1.0;
        // Match score multiplier
        baseRate *= (1 + matchScore.score);
        // Recent interaction bonus
        if (this.hasRecentInteraction(connection)) {
            baseRate *= 1.3;
        }
        return Math.min(Math.round(baseRate * 100), 85); // Cap at 85%
    }
    generateIntroductionMessage(account, connection, matchScore) {
        const templates = {
            direct: `Hi ${connection.firstName}, I noticed you work at ${account.name}. I'd love to connect you with a solution that could help with your background screening needs.`,
            industry: `Hi ${connection.firstName}, given your experience in ${connection.industry}, I'd appreciate your perspective on a background screening solution I'm working with. Could you connect me with the right person at ${account.name}?`,
            location: `Hi ${connection.firstName}, hope you're doing well in ${connection.location}! I'm working with companies in your area on background screening solutions and would love to get connected with ${account.name}.`,
            mutual: `Hi ${connection.firstName}, given our mutual connections and your role at ${connection.company}, I'd appreciate an introduction to the HR team at ${account.name} regarding background screening solutions.`
        };
        return templates[matchScore.pathType] || templates.mutual;
    }
    generateRecommendedAction(account, connection, matchScore) {
        if (matchScore.pathType === 'direct') {
            return `Message ${connection.firstName} directly about FA solutions`;
        }
        if (connection.relationshipStrength === 'strong') {
            return `Request warm introduction to ${account.name} HR team`;
        }
        if (this.hasRecentInteraction(connection)) {
            return `Reference recent LinkedIn interaction in outreach`;
        }
        return `Send connection request with personalized message`;
    }
    generateTimeline(confidenceScore, relationshipStrength) {
        if (confidenceScore > 0.7 && relationshipStrength === 'strong') {
            return '1-2 days';
        }
        if (confidenceScore > 0.5) {
            return '3-5 days';
        }
        if (relationshipStrength === 'strong' || relationshipStrength === 'warm') {
            return '1 week';
        }
        return '2-3 weeks';
    }
    determinePriority(confidenceScore, urgencyScore) {
        const combinedScore = (confidenceScore * 0.6) + ((urgencyScore / 100) * 0.4);
        if (combinedScore > 0.8)
            return 'urgent';
        if (combinedScore > 0.6)
            return 'high';
        if (combinedScore > 0.4)
            return 'medium';
        return 'low';
    }
    getTopWarmIntros(limit = 10) {
        return this.findWarmIntroPaths().slice(0, limit);
    }
    getConnectionsForAccount(accountId) {
        return this.findWarmIntroPaths().filter(path => path.accountId === accountId);
    }
    getRelationshipStats() {
        const allPaths = this.findWarmIntroPaths();
        return {
            totalConnections: this.connections.length,
            totalAccounts: this.accounts.length,
            warmPathways: allPaths.length,
            averageConfidence: allPaths.reduce((sum, path) => sum + path.confidenceScore, 0) / allPaths.length,
            priorityBreakdown: {
                urgent: allPaths.filter(p => p.priority === 'urgent').length,
                high: allPaths.filter(p => p.priority === 'high').length,
                medium: allPaths.filter(p => p.priority === 'medium').length,
                low: allPaths.filter(p => p.priority === 'low').length
            },
            strongRelationships: this.connections.filter(c => c.relationshipStrength === 'strong').length,
            directCompanyMatches: allPaths.filter(p => p.pathType === 'direct').length,
            industryMatches: allPaths.filter(p => p.pathType === 'industry').length
        };
    }
}
exports.RelationshipMappingService = RelationshipMappingService;
exports.relationshipMappingService = new RelationshipMappingService();
//# sourceMappingURL=relationshipMappingService.js.map