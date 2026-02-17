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
  strength: number;  // 0.0 - 1.0
  context?: string;  // "Worked together at Microsoft 2019-2021"
  lastInteraction?: Date;
  mutualConnections?: number;
  verified: boolean;
}

export type RelationshipType = 
  | 'colleague'
  | 'former_colleague'
  | 'classmate'
  | 'friend'
  | 'family'
  | 'mentor'
  | 'mentee'
  | 'manager'
  | 'direct_report'
  | 'vendor'
  | 'customer'
  | 'partner'
  | 'acquaintance'
  | 'other';

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
  directConnections: number;     // 1st degree
  secondDegree: number;          // 2nd degree
  thirdDegree: number;           // 3rd degree
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
export class RelationshipEngine {
  private nodes: Map<string, NetworkNode>;
  private adjacencyList: Map<string, NetworkEdge[]>;
  private userId: string;

  constructor(userId: string) {
    this.nodes = new Map();
    this.adjacencyList = new Map();
    this.userId = userId;
  }

  /**
   * Add a node to the network graph
   */
  addNode(node: NetworkNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  /**
   * Add an edge (relationship) between two nodes
   */
  addEdge(edge: NetworkEdge): void {
    // Ensure both nodes exist
    if (!this.adjacencyList.has(edge.sourceId)) {
      this.adjacencyList.set(edge.sourceId, []);
    }
    if (!this.adjacencyList.has(edge.targetId)) {
      this.adjacencyList.set(edge.targetId, []);
    }

    // Add bidirectional edges (relationships go both ways)
    this.adjacencyList.get(edge.sourceId)!.push(edge);
    
    // Create reverse edge
    const reverseEdge: NetworkEdge = {
      ...edge,
      sourceId: edge.targetId,
      targetId: edge.sourceId
    };
    this.adjacencyList.get(edge.targetId)!.push(reverseEdge);
  }

  /**
   * Bulk load network data
   */
  loadNetwork(nodes: NetworkNode[], edges: NetworkEdge[]): void {
    nodes.forEach(node => this.addNode(node));
    edges.forEach(edge => this.addEdge(edge));
  }

  /**
   * Find shortest path to target contact using BFS with weighted scoring
   * Returns up to maxPaths alternative paths
   */
  findPaths(
    targetId: string,
    maxDepth: number = 7,
    maxPaths: number = 3
  ): PathResult | null {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return null;

    interface QueueItem {
      nodeId: string;
      path: PathHop[];
      confidence: number;
      visited: Set<string>;
    }

    const allPaths: { path: PathHop[]; confidence: number }[] = [];
    const queue: QueueItem[] = [{
      nodeId: this.userId,
      path: [{
        nodeId: this.userId,
        name: 'You',
        title: 'Sales Executive',
        company: 'First Advantage'
      }],
      confidence: 1.0,
      visited: new Set([this.userId])
    }];

    // BFS to find all paths up to maxDepth
    while (queue.length > 0 && allPaths.length < maxPaths * 2) {
      const current = queue.shift()!;

      // Found target
      if (current.nodeId === targetId) {
        allPaths.push({
          path: current.path,
          confidence: current.confidence
        });
        continue;
      }

      // Max depth reached
      if (current.path.length >= maxDepth + 1) {
        continue;
      }

      // Explore neighbors
      const edges = this.adjacencyList.get(current.nodeId) || [];
      
      for (const edge of edges) {
        if (current.visited.has(edge.targetId)) continue;

        const nextNode = this.nodes.get(edge.targetId);
        if (!nextNode) continue;

        const newVisited = new Set(current.visited);
        newVisited.add(edge.targetId);

        const hop: PathHop = {
          nodeId: edge.targetId,
          name: nextNode.name,
          title: nextNode.title,
          company: nextNode.company,
          relationshipType: edge.relationshipType,
          edgeStrength: edge.strength,
          context: edge.context
        };

        queue.push({
          nodeId: edge.targetId,
          path: [...current.path, hop],
          confidence: current.confidence * edge.strength,
          visited: newVisited
        });
      }

      // Sort queue by path length (shortest first) then by confidence
      queue.sort((a, b) => {
        if (a.path.length !== b.path.length) {
          return a.path.length - b.path.length;
        }
        return b.confidence - a.confidence;
      });
    }

    if (allPaths.length === 0) return null;

    // Sort paths by confidence, take best as primary
    allPaths.sort((a, b) => {
      // Prefer shorter paths
      if (a.path.length !== b.path.length) {
        return a.path.length - b.path.length;
      }
      // Then by confidence
      return b.confidence - a.confidence;
    });

    const bestPath = allPaths[0];
    const degrees = bestPath.path.length - 1;
    
    return {
      targetId,
      targetName: targetNode.name,
      targetTitle: targetNode.title,
      targetCompany: targetNode.company,
      degrees,
      path: bestPath.path,
      confidence: bestPath.confidence,
      introSuccessRate: this.calculateIntroSuccessRate(bestPath.path),
      suggestedIntroMessage: this.generateIntroMessage(bestPath.path),
      alternativePaths: allPaths.slice(1, maxPaths).map(p => p.path)
    };
  }

  /**
   * Find all reachable targets within maxDegrees
   */
  findAllReachable(
    maxDegrees: number = 4
  ): Map<number, NetworkNode[]> {
    const result = new Map<number, NetworkNode[]>();
    const visited = new Set<string>();
    const currentLevel = new Set<string>([this.userId]);
    
    visited.add(this.userId);

    for (let degree = 1; degree <= maxDegrees; degree++) {
      const nextLevel = new Set<string>();
      const nodesAtDegree: NetworkNode[] = [];

      for (const nodeId of currentLevel) {
        const edges = this.adjacencyList.get(nodeId) || [];
        
        for (const edge of edges) {
          if (!visited.has(edge.targetId)) {
            visited.add(edge.targetId);
            nextLevel.add(edge.targetId);
            
            const node = this.nodes.get(edge.targetId);
            if (node) {
              nodesAtDegree.push(node);
            }
          }
        }
      }

      result.set(degree, nodesAtDegree);
      currentLevel.clear();
      nextLevel.forEach(id => currentLevel.add(id));
    }

    return result;
  }

  /**
   * Get network statistics
   */
  getNetworkStats(): NetworkStats {
    const reachable = this.findAllReachable(3);
    const companies = new Set<string>();
    
    this.nodes.forEach(node => {
      if (node.company) companies.add(node.company);
    });

    // Calculate average edge strength
    let totalStrength = 0;
    let edgeCount = 0;
    this.adjacencyList.forEach(edges => {
      edges.forEach(edge => {
        totalStrength += edge.strength;
        edgeCount++;
      });
    });

    return {
      totalNodes: this.nodes.size,
      totalEdges: edgeCount / 2, // Bidirectional, so divide by 2
      directConnections: reachable.get(1)?.length || 0,
      secondDegree: reachable.get(2)?.length || 0,
      thirdDegree: reachable.get(3)?.length || 0,
      maxReachableCompanies: companies.size,
      averageStrength: edgeCount > 0 ? totalStrength / edgeCount : 0
    };
  }

  /**
   * Calculate introduction success rate based on path
   */
  private calculateIntroSuccessRate(path: PathHop[]): number {
    if (path.length < 2) return 0;

    // Base success rate by degrees of separation
    const degreeSuccessRates: Record<number, number> = {
      1: 0.85,  // Direct intro
      2: 0.70,  // One hop
      3: 0.55,  // Two hops
      4: 0.40,  // Three hops
      5: 0.25,  // Four hops
      6: 0.15,  // Five hops
      7: 0.10   // Six hops
    };

    const degrees = path.length - 1;
    let baseRate = degreeSuccessRates[degrees] || 0.05;

    // Adjust based on relationship strength through the path
    let strengthMultiplier = 1.0;
    for (const hop of path) {
      if (hop.edgeStrength !== undefined) {
        strengthMultiplier *= hop.edgeStrength;
      }
    }

    // Adjust based on relationship types
    let typeBonus = 0;
    const strongTypes: RelationshipType[] = ['colleague', 'former_colleague', 'mentor', 'mentee', 'manager'];
    const mediumTypes: RelationshipType[] = ['classmate', 'friend', 'partner'];

    for (const hop of path) {
      if (hop.relationshipType) {
        if (strongTypes.includes(hop.relationshipType)) {
          typeBonus += 0.05;
        } else if (mediumTypes.includes(hop.relationshipType)) {
          typeBonus += 0.03;
        }
      }
    }

    const finalRate = Math.min(0.95, (baseRate * strengthMultiplier) + typeBonus);
    return Math.round(finalRate * 100) / 100;
  }

  /**
   * Generate personalized introduction message
   */
  private generateIntroMessage(path: PathHop[]): string {
    if (path.length < 3) {
      return "Direct connection - reach out directly!";
    }

    const connector = path[1];  // First hop after user
    const target = path[path.length - 1];
    
    const templates = this.getIntroTemplates();
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    let message = template.template;
    
    // Replace variables
    message = message.replace(/\{connector\.name\}/g, connector.name);
    message = message.replace(/\{connector\.company\}/g, connector.company || 'their company');
    message = message.replace(/\{target\.name\}/g, target.name);
    message = message.replace(/\{target\.company\}/g, target.company || 'their company');
    message = message.replace(/\{target\.title\}/g, target.title || 'their role');
    message = message.replace(/\{relationship\.context\}/g, connector.context || 'our professional connection');

    return message;
  }

  /**
   * Get introduction message templates
   */
  private getIntroTemplates(): IntroTemplate[] {
    return [
      {
        template: `Hi {connector.name}! Hope you're doing well. I'm reaching out to enterprise companies about AI transformation initiatives and noticed your connection with {target.name} at {target.company}. Given {relationship.context}, would you be comfortable making a brief introduction? I think there could be some interesting synergies to explore.`,
        variables: ['connector.name', 'target.name', 'target.company', 'relationship.context'],
        successRate: 0.73,
        useCase: 'general'
      },
      {
        template: `Hey {connector.name}! Quick favor - I'm connecting with {target.title} leaders in the {target.company} space. Would it make sense for you to introduce me to {target.name}? Happy to keep it high-level initially and make it easy for you.`,
        variables: ['connector.name', 'target.title', 'target.company', 'target.name'],
        successRate: 0.68,
        useCase: 'executive'
      },
      {
        template: `{connector.name}, hope all is well at {connector.company}! I remember you mentioning your connection with {target.name}. I'm working on some initiatives that might be valuable for {target.company}. Would you mind facilitating a quick intro? I'd really appreciate it.`,
        variables: ['connector.name', 'connector.company', 'target.name', 'target.company'],
        successRate: 0.71,
        useCase: 'warm'
      },
      {
        template: `Hi {connector.name}! Thinking of you - it's been a while since {relationship.context}. I'm exploring some conversations with companies like {target.company} and saw you know {target.name}. Any chance you'd be open to a soft intro? No pressure either way!`,
        variables: ['connector.name', 'relationship.context', 'target.company', 'target.name'],
        successRate: 0.65,
        useCase: 'reconnect'
      }
    ];
  }

  /**
   * Suggest best connectors for a target
   */
  suggestBestConnectors(targetId: string): {
    connectorId: string;
    connectorName: string;
    pathLength: number;
    strength: number;
    recommendationReason: string;
  }[] {
    const result = this.findPaths(targetId, 7, 5);
    if (!result) return [];

    const suggestions: {
      connectorId: string;
      connectorName: string;
      pathLength: number;
      strength: number;
      recommendationReason: string;
    }[] = [];

    // Primary path connector
    if (result.path.length >= 2) {
      const connector = result.path[1];
      suggestions.push({
        connectorId: connector.nodeId,
        connectorName: connector.name,
        pathLength: result.degrees,
        strength: connector.edgeStrength || 0.5,
        recommendationReason: `Best path: ${result.degrees}° separation with ${Math.round(result.introSuccessRate * 100)}% success rate`
      });
    }

    // Alternative paths
    for (const altPath of result.alternativePaths) {
      if (altPath.length >= 2) {
        const connector = altPath[1];
        const existing = suggestions.find(s => s.connectorId === connector.nodeId);
        if (!existing) {
          suggestions.push({
            connectorId: connector.nodeId,
            connectorName: connector.name,
            pathLength: altPath.length - 1,
            strength: connector.edgeStrength || 0.5,
            recommendationReason: `Alternative path: ${altPath.length - 1}° separation`
          });
        }
      }
    }

    return suggestions.sort((a, b) => {
      if (a.pathLength !== b.pathLength) return a.pathLength - b.pathLength;
      return b.strength - a.strength;
    });
  }

  /**
   * Find warm intro opportunities for an account's contacts
   */
  findWarmIntrosForAccount(contactIds: string[]): Map<string, PathResult | null> {
    const results = new Map<string, PathResult | null>();
    
    for (const contactId of contactIds) {
      const path = this.findPaths(contactId);
      results.set(contactId, path);
    }

    return results;
  }

  /**
   * Analyze relationship strength between two nodes
   */
  analyzeRelationship(nodeId1: string, nodeId2: string): {
    directConnection: boolean;
    strength: number;
    commonConnections: NetworkNode[];
    recommendedActions: string[];
  } {
    const edges1 = this.adjacencyList.get(nodeId1) || [];
    const directEdge = edges1.find(e => e.targetId === nodeId2);

    // Find common connections
    const connections1 = new Set(edges1.map(e => e.targetId));
    const edges2 = this.adjacencyList.get(nodeId2) || [];
    const connections2 = new Set(edges2.map(e => e.targetId));
    
    const commonIds = [...connections1].filter(id => connections2.has(id));
    const commonConnections = commonIds
      .map(id => this.nodes.get(id))
      .filter((n): n is NetworkNode => n !== undefined);

    const recommendedActions: string[] = [];

    if (directEdge) {
      if (directEdge.strength < 0.5) {
        recommendedActions.push('Strengthen relationship with regular touchpoints');
      }
      if (!directEdge.lastInteraction || 
          Date.now() - new Date(directEdge.lastInteraction).getTime() > 90 * 24 * 60 * 60 * 1000) {
        recommendedActions.push('Reconnect - no recent interaction');
      }
    } else {
      if (commonConnections.length > 0) {
        recommendedActions.push(`Get introduced via ${commonConnections[0].name}`);
      } else {
        recommendedActions.push('Consider LinkedIn connection request');
      }
    }

    return {
      directConnection: !!directEdge,
      strength: directEdge?.strength || 0,
      commonConnections,
      recommendedActions
    };
  }

  /**
   * Export network for visualization (D3/vis.js format)
   */
  exportForVisualization(): {
    nodes: { id: string; label: string; group: string; size: number }[];
    edges: { from: string; to: string; value: number; label?: string }[];
  } {
    const visNodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      label: node.name,
      group: node.type,
      size: node.type === 'user' ? 30 : node.isTarget ? 25 : 15
    }));

    const seenEdges = new Set<string>();
    const visEdges: { from: string; to: string; value: number; label?: string }[] = [];

    this.adjacencyList.forEach((edges, sourceId) => {
      edges.forEach(edge => {
        const edgeKey = [edge.sourceId, edge.targetId].sort().join('-');
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          visEdges.push({
            from: edge.sourceId,
            to: edge.targetId,
            value: edge.strength * 10,
            label: edge.relationshipType
          });
        }
      });
    });

    return { nodes: visNodes, edges: visEdges };
  }
}

/**
 * Factory function to create and initialize a RelationshipEngine
 */
export async function createRelationshipEngine(
  userId: string,
  connections: Array<{
    id: string;
    name: string;
    title?: string;
    company?: string;
    linkedinId?: string;
    relationshipType: RelationshipType;
    strength: number;
    context?: string;
    lastInteraction?: Date;
  }>,
  secondDegreeConnections?: Array<{
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
  }>
): Promise<RelationshipEngine> {
  const engine = new RelationshipEngine(userId);

  // Add user node
  engine.addNode({
    id: userId,
    type: 'user',
    name: 'You',
    title: 'Sales Executive'
  });

  // Add first-degree connections
  for (const conn of connections) {
    engine.addNode({
      id: conn.id,
      type: 'connection',
      name: conn.name,
      title: conn.title,
      company: conn.company,
      linkedinId: conn.linkedinId
    });

    engine.addEdge({
      sourceId: userId,
      targetId: conn.id,
      relationshipType: conn.relationshipType,
      strength: conn.strength,
      context: conn.context,
      lastInteraction: conn.lastInteraction,
      verified: true
    });
  }

  // Add second-degree connections if provided
  if (secondDegreeConnections) {
    for (const conn of secondDegreeConnections) {
      if (!engine['nodes'].has(conn.target.id)) {
        engine.addNode({
          id: conn.target.id,
          type: 'contact',
          name: conn.target.name,
          title: conn.target.title,
          company: conn.target.company,
          linkedinId: conn.target.linkedinId
        });
      }

      engine.addEdge({
        sourceId: conn.sourceId,
        targetId: conn.target.id,
        relationshipType: conn.relationshipType,
        strength: conn.strength,
        context: conn.context,
        verified: false
      });
    }
  }

  return engine;
}

export default RelationshipEngine;
