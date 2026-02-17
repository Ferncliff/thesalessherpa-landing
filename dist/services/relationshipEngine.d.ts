/**
 * TheSalesSherpa Relationship Mapping Engine
 *
 * Advanced graph-based relationship intelligence that discovers
 * and scores connection paths up to 7 degrees of separation.
 *
 * Uses BFS (Breadth-First Search) for shortest path discovery
 * with weighted edges based on relationship strength.
 */
export interface NetworkNode {
    id: string;
    type: 'user' | 'contact' | 'connection';
    name: string;
    title?: string;
    company?: string;
    linkedinId?: string;
    email?: string;
    isTarget?: boolean;
}
export interface NetworkEdge {
    sourceId: string;
    targetId: string;
    relationshipType: RelationshipType;
    strength: number;
    context?: string;
    lastInteraction?: Date;
    mutualConnections?: number;
    verified: boolean;
}
export type RelationshipType = 'colleague' | 'former_colleague' | 'classmate' | 'friend' | 'family' | 'mentor' | 'mentee' | 'manager' | 'direct_report' | 'vendor' | 'customer' | 'partner' | 'acquaintance' | 'other';
export interface PathResult {
    targetId: string;
    targetName: string;
    targetTitle?: string;
    targetCompany?: string;
    degrees: number;
    path: PathHop[];
    confidence: number;
    introSuccessRate: number;
    suggestedIntroMessage?: string;
    alternativePaths: PathHop[][];
}
export interface PathHop {
    nodeId: string;
    name: string;
    title?: string;
    company?: string;
    relationshipType?: RelationshipType;
    edgeStrength?: number;
    context?: string;
}
export interface NetworkStats {
    totalNodes: number;
    totalEdges: number;
    directConnections: number;
    secondDegree: number;
    thirdDegree: number;
    maxReachableCompanies: number;
    averageStrength: number;
}
export interface IntroTemplate {
    template: string;
    variables: string[];
    successRate: number;
    useCase: string;
}
/**
 * Main Relationship Engine class
 */
export declare class RelationshipEngine {
    private nodes;
    private adjacencyList;
    private userId;
    constructor(userId: string);
    /**
     * Add a node to the network graph
     */
    addNode(node: NetworkNode): void;
    /**
     * Add an edge (relationship) between two nodes
     */
    addEdge(edge: NetworkEdge): void;
    /**
     * Bulk load network data
     */
    loadNetwork(nodes: NetworkNode[], edges: NetworkEdge[]): void;
    /**
     * Find shortest path to target contact using BFS with weighted scoring
     * Returns up to maxPaths alternative paths
     */
    findPaths(targetId: string, maxDepth?: number, maxPaths?: number): PathResult | null;
    /**
     * Find all reachable targets within maxDegrees
     */
    findAllReachable(maxDegrees?: number): Map<number, NetworkNode[]>;
    /**
     * Get network statistics
     */
    getNetworkStats(): NetworkStats;
    /**
     * Calculate introduction success rate based on path
     */
    private calculateIntroSuccessRate;
    /**
     * Generate personalized introduction message
     */
    private generateIntroMessage;
    /**
     * Get introduction message templates
     */
    private getIntroTemplates;
    /**
     * Suggest best connectors for a target
     */
    suggestBestConnectors(targetId: string): {
        connectorId: string;
        connectorName: string;
        pathLength: number;
        strength: number;
        recommendationReason: string;
    }[];
    /**
     * Find warm intro opportunities for an account's contacts
     */
    findWarmIntrosForAccount(contactIds: string[]): Map<string, PathResult | null>;
    /**
     * Analyze relationship strength between two nodes
     */
    analyzeRelationship(nodeId1: string, nodeId2: string): {
        directConnection: boolean;
        strength: number;
        commonConnections: NetworkNode[];
        recommendedActions: string[];
    };
    /**
     * Export network for visualization (D3/vis.js format)
     */
    exportForVisualization(): {
        nodes: {
            id: string;
            label: string;
            group: string;
            size: number;
        }[];
        edges: {
            from: string;
            to: string;
            value: number;
            label?: string;
        }[];
    };
}
/**
 * Factory function to create and initialize a RelationshipEngine
 */
export declare function createRelationshipEngine(userId: string, connections: Array<{
    id: string;
    name: string;
    title?: string;
    company?: string;
    linkedinId?: string;
    relationshipType: RelationshipType;
    strength: number;
    context?: string;
    lastInteraction?: Date;
}>, secondDegreeConnections?: Array<{
    sourceId: string;
    target: {
        id: string;
        name: string;
        title?: string;
        company?: string;
        linkedinId?: string;
    };
    relationshipType: RelationshipType;
    strength: number;
    context?: string;
}>): Promise<RelationshipEngine>;
export default RelationshipEngine;
//# sourceMappingURL=relationshipEngine.d.ts.map