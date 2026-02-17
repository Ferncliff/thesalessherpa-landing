interface WarmIntroPath {
    accountId: string;
    accountName: string;
    connectionId: string;
    connectionName: string;
    connectionTitle: string;
    connectionCompany: string;
    pathType: 'direct' | 'industry' | 'location' | 'mutual';
    confidenceScore: number;
    relationshipStrength: string;
    introductionMessage: string;
    expectedSuccessRate: number;
    reasoning: string;
    urgencyScore: number;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    recommendedAction: string;
    timeline: string;
}
declare class RelationshipMappingService {
    private connections;
    private accounts;
    constructor();
    private loadData;
    findWarmIntroPaths(): WarmIntroPath[];
    private calculateMatchScore;
    private checkIndustryMatch;
    private checkLocationMatch;
    private hasRecentInteraction;
    private calculateSuccessRate;
    private generateIntroductionMessage;
    private generateRecommendedAction;
    private generateTimeline;
    private determinePriority;
    getTopWarmIntros(limit?: number): WarmIntroPath[];
    getConnectionsForAccount(accountId: string): WarmIntroPath[];
    getRelationshipStats(): any;
}
export declare const relationshipMappingService: RelationshipMappingService;
export { WarmIntroPath, RelationshipMappingService };
//# sourceMappingURL=relationshipMappingService.d.ts.map