#!/usr/bin/env node

/**
 * Process Matt's Full LinkedIn Connections Data
 * 
 * Integrates 1,040+ LinkedIn connections with FA territory accounts
 * to identify warm introduction pathways and relationship mapping
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

async function processMattsConnections() {
  try {
    console.log('🔗 Processing Matt\'s LinkedIn Connections (1,040+ contacts)...');
    
    // Read Matt's connections data
    const connectionsPath = path.join(__dirname, '..', 'data', 'linkedin', 'Connections.csv');
    const connectionsRaw = fs.readFileSync(connectionsPath, 'utf8');
    
    // Parse CSV (skip the notes section at the top)
    const lines = connectionsRaw.split('\n');
    const csvStart = lines.findIndex(line => line.startsWith('First Name,Last Name'));
    const csvData = lines.slice(csvStart).join('\n');
    
    const connections = csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`✅ Parsed ${connections.length} LinkedIn connections`);
    
    // Load Matt's FA territory accounts
    const accountsPath = path.join(__dirname, '..', 'data', 'accounts', 'matt_fa_accounts_with_ats.json');
    const accountsData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
    
    // Process connections for relationship intelligence
    const processedConnections = connections.map((connection, index) => {
      const fullName = `${connection['First Name']} ${connection['Last Name']}`.trim();
      const company = connection['Company'] || '';
      const position = connection['Position'] || '';
      const connectedOn = connection['Connected On'] || '';
      const linkedinUrl = connection['URL'] || '';
      const email = connection['Email Address'] || '';
      
      // Calculate relationship strength based on various factors
      const relationshipStrength = calculateRelationshipStrength(connection, index);
      
      // Categorize by industry and role
      const category = categorizeConnection(company, position);
      
      return {
        id: `conn-${index + 1}`,
        fullName,
        firstName: connection['First Name'] || '',
        lastName: connection['Last Name'] || '',
        company,
        position,
        linkedinUrl,
        email,
        connectedOn,
        relationshipStrength,
        category,
        // Potential warm intro value
        introValue: calculateIntroValue(company, position, relationshipStrength),
        // Industry classification
        industry: classifyIndustry(company),
        // Decision maker score
        decisionMakerScore: calculateDecisionMakerScore(position),
      };
    });
    
    // Find connections to companies in Matt's territory
    const territoryMatches = findTerritoryMatches(processedConnections, accountsData.accounts);
    
    // Find ATS vendor connections
    const atsConnections = findATSVendorConnections(processedConnections);
    
    // Find high-value decision makers
    const decisionMakers = processedConnections
      .filter(conn => conn.decisionMakerScore >= 80)
      .sort((a, b) => b.decisionMakerScore - a.decisionMakerScore);
    
    // Generate relationship intelligence report
    const relationshipIntelligence = {
      metadata: {
        totalConnections: processedConnections.length,
        processedAt: new Date().toISOString(),
        source: 'LinkedIn Full Export',
        owner: 'Matt Edwards'
      },
      connections: processedConnections,
      territoryMatches: territoryMatches,
      atsVendorConnections: atsConnections,
      topDecisionMakers: decisionMakers.slice(0, 50),
      industryBreakdown: generateIndustryBreakdown(processedConnections),
      relationshipStrengthDistribution: generateStrengthDistribution(processedConnections)
    };
    
    // Save processed data
    const outputPath = path.join(__dirname, '..', 'data', 'processed', 'matt_full_linkedin_network.json');
    fs.writeFileSync(outputPath, JSON.stringify(relationshipIntelligence, null, 2));
    
    console.log(`✅ Processed complete LinkedIn network:`);
    console.log(`   • Total connections: ${processedConnections.length}`);
    console.log(`   • Territory matches: ${territoryMatches.length}`);
    console.log(`   • ATS vendor connections: ${atsConnections.length}`);
    console.log(`   • High-value decision makers: ${decisionMakers.length}`);
    console.log(`   • Industries represented: ${Object.keys(generateIndustryBreakdown(processedConnections)).length}`);
    
    // Generate specific warm intro opportunities for top FA accounts
    await generateWarmIntroOpportunities(territoryMatches, accountsData.accounts);
    
    console.log('\n🎯 Relationship mapping complete! Ready for VP demo integration.');
    
  } catch (error) {
    console.error('❌ Error processing LinkedIn connections:', error);
    process.exit(1);
  }
}

function calculateRelationshipStrength(connection, index) {
  let strength = 50; // Base strength
  
  // Recent connections are potentially stronger
  const connectedDate = new Date(connection['Connected On']);
  const daysSinceConnection = (Date.now() - connectedDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceConnection < 30) strength += 20; // Recent connection
  else if (daysSinceConnection < 90) strength += 10;
  else if (daysSinceConnection > 365 * 2) strength -= 10; // Old connection
  
  // Internal FA connections are strong
  if (connection['Company']?.toLowerCase().includes('first advantage')) {
    strength += 30;
  }
  
  // Email provided suggests stronger connection
  if (connection['Email Address']) {
    strength += 15;
  }
  
  // Senior positions suggest valuable connections
  const position = connection['Position']?.toLowerCase() || '';
  if (position.includes('ceo') || position.includes('president')) strength += 25;
  else if (position.includes('vp') || position.includes('director')) strength += 15;
  else if (position.includes('manager')) strength += 10;
  
  return Math.min(100, Math.max(10, strength));
}

function categorizeConnection(company, position) {
  const companyLower = company.toLowerCase();
  const positionLower = position.toLowerCase();
  
  if (companyLower.includes('first advantage')) return 'internal';
  if (positionLower.includes('sales')) return 'sales_professional';
  if (positionLower.includes('hr') || positionLower.includes('human resources')) return 'hr_decision_maker';
  if (positionLower.includes('ceo') || positionLower.includes('president')) return 'c_suite';
  if (positionLower.includes('vp') || positionLower.includes('director')) return 'senior_leadership';
  if (companyLower.includes('workday') || companyLower.includes('icims') || companyLower.includes('bamboo')) return 'ats_vendor';
  
  return 'general_professional';
}

function calculateIntroValue(company, position, relationshipStrength) {
  let value = relationshipStrength * 0.5; // Base on relationship strength
  
  // High-value companies
  const valuableCompanies = ['workday', 'salesforce', 'microsoft', 'oracle', 'sap'];
  if (valuableCompanies.some(comp => company.toLowerCase().includes(comp))) {
    value += 30;
  }
  
  // High-value positions
  const position_lower = position.toLowerCase();
  if (position_lower.includes('partnership') || position_lower.includes('alliance')) value += 25;
  if (position_lower.includes('sales') && (position_lower.includes('director') || position_lower.includes('vp'))) value += 20;
  
  return Math.min(100, Math.max(10, value));
}

function classifyIndustry(company) {
  const companyLower = company.toLowerCase();
  
  if (companyLower.includes('technology') || companyLower.includes('software') || companyLower.includes('tech')) return 'Technology';
  if (companyLower.includes('financial') || companyLower.includes('bank') || companyLower.includes('capital')) return 'Financial Services';
  if (companyLower.includes('healthcare') || companyLower.includes('medical') || companyLower.includes('pharma')) return 'Healthcare';
  if (companyLower.includes('consulting')) return 'Consulting';
  if (companyLower.includes('manufacturing')) return 'Manufacturing';
  if (companyLower.includes('retail')) return 'Retail';
  if (companyLower.includes('education') || companyLower.includes('university')) return 'Education';
  
  return 'Other';
}

function calculateDecisionMakerScore(position) {
  const positionLower = position.toLowerCase();
  
  if (positionLower.includes('ceo') || positionLower.includes('founder')) return 100;
  if (positionLower.includes('president')) return 95;
  if (positionLower.includes('cto') || positionLower.includes('cfo') || positionLower.includes('coo')) return 90;
  if (positionLower.includes('vp')) return 85;
  if (positionLower.includes('director')) return 75;
  if (positionLower.includes('manager')) return 60;
  if (positionLower.includes('senior')) return 55;
  
  return 40;
}

function findTerritoryMatches(connections, accounts) {
  const matches = [];
  
  accounts.forEach(account => {
    const accountName = account.name.toLowerCase();
    const matchingConnections = connections.filter(conn => {
      const companyLower = conn.company.toLowerCase();
      return companyLower.includes(accountName) || accountName.includes(companyLower);
    });
    
    if (matchingConnections.length > 0) {
      matches.push({
        accountId: account.id,
        accountName: account.name,
        connections: matchingConnections,
        urgencyScore: account.urgencyScore,
        ats: account.ats
      });
    }
  });
  
  return matches.sort((a, b) => b.urgencyScore - a.urgencyScore);
}

function findATSVendorConnections(connections) {
  const atsVendors = ['workday', 'icims', 'sap', 'oracle', 'bamboo', 'greenhouse', 'lever'];
  
  return connections.filter(conn => {
    const companyLower = conn.company.toLowerCase();
    return atsVendors.some(vendor => companyLower.includes(vendor));
  }).sort((a, b) => b.relationshipStrength - a.relationshipStrength);
}

function generateIndustryBreakdown(connections) {
  const breakdown = {};
  connections.forEach(conn => {
    breakdown[conn.industry] = (breakdown[conn.industry] || 0) + 1;
  });
  return breakdown;
}

function generateStrengthDistribution(connections) {
  const distribution = {
    'Very Strong (80+)': 0,
    'Strong (60-79)': 0,
    'Moderate (40-59)': 0,
    'Weak (20-39)': 0,
    'Very Weak (<20)': 0
  };
  
  connections.forEach(conn => {
    if (conn.relationshipStrength >= 80) distribution['Very Strong (80+)']++;
    else if (conn.relationshipStrength >= 60) distribution['Strong (60-79)']++;
    else if (conn.relationshipStrength >= 40) distribution['Moderate (40-59)']++;
    else if (conn.relationshipStrength >= 20) distribution['Weak (20-39)']++;
    else distribution['Very Weak (<20)']++;
  });
  
  return distribution;
}

async function generateWarmIntroOpportunities(territoryMatches, accounts) {
  console.log('\n🔥 Generating warm intro opportunities for top accounts...');
  
  const opportunities = territoryMatches.slice(0, 10).map(match => {
    const bestConnection = match.connections.sort((a, b) => b.relationshipStrength - a.relationshipStrength)[0];
    
    return {
      accountId: match.accountId,
      accountName: match.accountName,
      urgency: match.urgencyScore,
      introPath: `Matt Edwards → ${bestConnection.fullName} (${bestConnection.position}) → Target Decision Maker`,
      connectionStrength: bestConnection.relationshipStrength,
      strategy: generateIntroStrategy(bestConnection, match),
      ats: match.ats?.currentATS?.provider
    };
  });
  
  const outputPath = path.join(__dirname, '..', 'data', 'processed', 'warm_intro_opportunities.json');
  fs.writeFileSync(outputPath, JSON.stringify({ opportunities, generatedAt: new Date().toISOString() }, null, 2));
  
  console.log(`✅ Generated ${opportunities.length} warm intro opportunities`);
  opportunities.forEach((opp, i) => {
    console.log(`${i + 1}. ${opp.accountName} → ${opp.introPath.split(' → ')[1]} (${opp.connectionStrength}/100 strength)`);
  });
}

function generateIntroStrategy(connection, match) {
  const strategies = [
    `Reach out to ${connection.firstName} mentioning shared First Advantage context and interest in connecting with their team`,
    `Reference recent industry trends and ask ${connection.firstName} for insights about challenges at ${match.accountName}`,
    `Share relevant case study with ${connection.firstName} and request introduction to appropriate decision maker`,
    `Invite ${connection.firstName} for coffee to discuss industry challenges and potential mutual opportunities`
  ];
  
  return strategies[Math.floor(Math.random() * strategies.length)];
}

// Run if called directly
if (require.main === module) {
  processMattsConnections();
}

module.exports = { processMattsConnections };