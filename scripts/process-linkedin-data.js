/**
 * Process Matt's LinkedIn Data Export for TheSalesSherpa
 * 
 * Converts LinkedIn CSV exports to relationship intelligence format
 */

const fs = require('fs');
const csv = require('csv-parse/sync');
const path = require('path');

// Load CSV data
function loadLinkedInData() {
  const dataDir = path.join(__dirname, '../data/linkedin');
  
  try {
    const profileData = fs.readFileSync(path.join(dataDir, 'Profile.csv'), 'utf8');
    const invitationsData = fs.readFileSync(path.join(dataDir, 'Invitations.csv'), 'utf8');
    
    const profile = csv.parse(profileData, { columns: true, skip_empty_lines: true })[0];
    const invitations = csv.parse(invitationsData, { columns: true, skip_empty_lines: true });
    
    return { profile, invitations };
  } catch (error) {
    console.error('Error loading LinkedIn data:', error);
    return null;
  }
}

// Extract connections from invitation data
function processConnections(invitations) {
  const connections = [];
  const seen = new Set();
  
  invitations.forEach((invitation, index) => {
    let connectionName, connectionUrl, direction, date, message;
    
    if (invitation.Direction === 'INCOMING') {
      connectionName = invitation.From;
      connectionUrl = invitation.inviterProfileUrl;
      direction = 'incoming';
    } else {
      connectionName = invitation.To;
      connectionUrl = invitation.inviteeProfileUrl;
      direction = 'outgoing';
    }
    
    // Skip if already processed this person
    if (seen.has(connectionUrl)) return;
    seen.add(connectionUrl);
    
    // Parse name components
    const nameParts = connectionName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ').replace(/[",]/g, '');
    
    // Extract LinkedIn username from URL
    const username = connectionUrl.match(/linkedin\.com\/in\/([^/?]+)/)?.[1] || '';
    
    // Parse date
    const sentDate = new Date(invitation['Sent At']);
    
    const connection = {
      id: `linkedin-${username}`,
      firstName,
      lastName,
      fullName: connectionName.replace(/[",]/g, ''),
      linkedinUrl: connectionUrl,
      linkedinUsername: username,
      relationshipType: direction === 'incoming' ? 'prospect' : 'outreach',
      connectionDate: sentDate,
      lastInteraction: sentDate,
      message: invitation.Message || '',
      strength: direction === 'incoming' ? 0.3 : 0.5, // Incoming connections are prospects, outgoing are warmer
      source: 'linkedin_export',
      
      // Placeholder data - would be enriched with additional profile data
      title: 'Unknown',
      company: 'Unknown',
      industry: 'Unknown',
      location: 'Unknown'
    };
    
    connections.push(connection);
  });
  
  return connections.sort((a, b) => b.connectionDate - a.connectionDate);
}

// Generate relationship intelligence summary
function generateIntelligenceSummary(connections) {
  const summary = {
    totalConnections: connections.length,
    incomingConnections: connections.filter(c => c.relationshipType === 'prospect').length,
    outgoingConnections: connections.filter(c => c.relationshipType === 'outreach').length,
    recentConnections: connections.filter(c => {
      const daysSince = (Date.now() - c.connectionDate) / (1000 * 60 * 60 * 24);
      return daysSince <= 90;
    }).length,
    
    // Top prospects (incoming connections with messages)
    topProspects: connections
      .filter(c => c.relationshipType === 'prospect' && c.message)
      .slice(0, 5)
      .map(c => ({
        name: c.fullName,
        linkedinUrl: c.linkedinUrl,
        message: c.message.substring(0, 200) + (c.message.length > 200 ? '...' : ''),
        date: c.connectionDate.toISOString().split('T')[0]
      })),
      
    // Recent outreach
    recentOutreach: connections
      .filter(c => c.relationshipType === 'outreach')
      .slice(0, 5)
      .map(c => ({
        name: c.fullName,
        linkedinUrl: c.linkedinUrl,
        date: c.connectionDate.toISOString().split('T')[0]
      }))
  };
  
  return summary;
}

// Main processing function
function processLinkedInData() {
  console.log('🔄 Processing Matt\'s LinkedIn data...');
  
  const data = loadLinkedInData();
  if (!data) {
    console.error('❌ Failed to load LinkedIn data');
    return;
  }
  
  console.log(`✅ Loaded profile data for: ${data.profile['First Name']} ${data.profile['Last Name']}`);
  console.log(`✅ Loaded ${data.invitations.length} invitation records`);
  
  // Process connections
  const connections = processConnections(data.invitations);
  console.log(`✅ Processed ${connections.length} unique connections`);
  
  // Generate intelligence summary
  const intelligence = generateIntelligenceSummary(connections);
  console.log(`✅ Generated intelligence summary`);
  
  // Save processed data
  const outputDir = path.join(__dirname, '../data/processed');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'matt_linkedin_connections.json'),
    JSON.stringify(connections, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'matt_linkedin_intelligence.json'),
    JSON.stringify(intelligence, null, 2)
  );
  
  // Display summary
  console.log('\n🎯 LINKEDIN INTELLIGENCE SUMMARY');
  console.log('═══════════════════════════════════');
  console.log(`Total Connections: ${intelligence.totalConnections}`);
  console.log(`Incoming (Prospects): ${intelligence.incomingConnections}`);
  console.log(`Outgoing (Outreach): ${intelligence.outgoingConnections}`);
  console.log(`Recent (90 days): ${intelligence.recentConnections}`);
  
  if (intelligence.topProspects.length > 0) {
    console.log('\n📈 TOP PROSPECTS (with messages):');
    intelligence.topProspects.forEach((prospect, i) => {
      console.log(`${i + 1}. ${prospect.name} (${prospect.date})`);
      console.log(`   Message: ${prospect.message}`);
    });
  }
  
  if (intelligence.recentOutreach.length > 0) {
    console.log('\n📤 RECENT OUTREACH:');
    intelligence.recentOutreach.forEach((contact, i) => {
      console.log(`${i + 1}. ${contact.name} (${contact.date})`);
    });
  }
  
  console.log('\n✅ Data saved to /data/processed/');
  console.log('Ready for TheSalesSherpa integration!');
}

// Run if called directly
if (require.main === module) {
  processLinkedInData();
}

module.exports = {
  processLinkedInData,
  loadLinkedInData,
  processConnections,
  generateIntelligenceSummary
};