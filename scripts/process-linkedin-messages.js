/**
 * Process LinkedIn Messages Data for Cadence Matrix Integration
 * 
 * When Matt gets the full LinkedIn export with Messages.csv,
 * this script will integrate messages into the Cadence Matrix
 */

const fs = require('fs');
const csv = require('csv-parse/sync');
const path = require('path');

// Process LinkedIn Messages CSV
function processLinkedInMessages() {
  const dataDir = path.join(__dirname, '../data/linkedin');
  
  console.log('🔄 Processing LinkedIn Messages for Cadence Matrix integration...');
  
  try {
    // Look for Messages.csv in LinkedIn export
    const messagesPath = path.join(dataDir, 'Messages.csv');
    
    if (!fs.existsSync(messagesPath)) {
      console.log('⏳ Messages.csv not found. Waiting for full LinkedIn export...');
      console.log('📋 Expected location: ' + messagesPath);
      return;
    }
    
    const messagesData = fs.readFileSync(messagesPath, 'utf8');
    const messages = csv.parse(messagesData, { columns: true, skip_empty_lines: true });
    
    console.log(`✅ Loaded ${messages.length} LinkedIn messages`);
    
    // Process messages for account/contact mapping
    const processedMessages = messages.map((msg, index) => {
      const isOutbound = msg.From && msg.From.includes('Matt Edwards');
      const contactName = isOutbound ? msg.To : msg.From;
      
      return {
        id: `linkedin-msg-${index}`,
        type: 'linkedin_message',
        direction: isOutbound ? 'outbound' : 'inbound',
        contactName: contactName.replace(/[",]/g, ''),
        content: msg.Content || msg.MESSAGE || '',
        date: new Date(msg.Date || msg.TIMESTAMP),
        conversationId: msg['Conversation ID'] || `conv-${index}`,
        
        // Business intelligence
        sentiment: analyzeSentiment(msg.Content || ''),
        businessRelevance: scoreBusinessRelevance(msg.Content || ''),
        responseIndicator: isResponseMessage(msg.Content || ''),
        
        // Account mapping data
        potentialAccounts: extractCompanyMentions(msg.Content || ''),
        urgencySignals: detectUrgencySignals(msg.Content || '')
      };
    });
    
    // Generate cross-channel integration data
    const integrationData = generateCadenceIntegration(processedMessages);
    
    // Save processed messages
    const outputDir = path.join(__dirname, '../data/processed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'matt_linkedin_messages.json'),
      JSON.stringify(processedMessages, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'cadence_integration.json'),
      JSON.stringify(integrationData, null, 2)
    );
    
    console.log('✅ LinkedIn Messages processed and ready for Cadence Matrix');
    console.log(`📊 Summary: ${processedMessages.length} messages, ${integrationData.uniqueContacts.length} unique contacts`);
    
    return { messages: processedMessages, integration: integrationData };
    
  } catch (error) {
    console.error('❌ Error processing LinkedIn Messages:', error);
    return null;
  }
}

// Business intelligence functions
function analyzeSentiment(content) {
  if (!content) return 'neutral';
  
  const positiveWords = ['excited', 'interested', 'great', 'excellent', 'perfect', 'thanks', 'appreciate'];
  const negativeWords = ['busy', 'not interested', 'no thanks', 'decline', 'pass'];
  
  const lowerContent = content.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function scoreBusinessRelevance(content) {
  if (!content) return 0;
  
  const businessKeywords = [
    'first advantage', 'background screening', 'tenant screening',
    'compliance', 'hiring', 'verification', 'security clearance',
    'meeting', 'call', 'discuss', 'opportunity', 'partnership'
  ];
  
  const lowerContent = content.toLowerCase();
  const matches = businessKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  
  return Math.min(matches * 20, 100); // 0-100 score
}

function isResponseMessage(content) {
  if (!content) return false;
  
  const responseIndicators = [
    'thanks for', 'appreciate', 'yes', 'sure', 'sounds good',
    'let me know', 'happy to', 'would be interested'
  ];
  
  const lowerContent = content.toLowerCase();
  return responseIndicators.some(indicator => lowerContent.includes(indicator));
}

function extractCompanyMentions(content) {
  if (!content) return [];
  
  // Simple company extraction (could be enhanced with NLP)
  const companyPattern = /\b[A-Z][a-zA-Z]{2,}\s+(Inc|LLC|Corp|Company|Group|Partners|Solutions)\b/g;
  const matches = content.match(companyPattern) || [];
  
  return [...new Set(matches)]; // Remove duplicates
}

function detectUrgencySignals(content) {
  if (!content) return [];
  
  const urgencyWords = [
    'asap', 'urgent', 'immediately', 'deadline', 'expires',
    'limited time', 'this week', 'today', 'tomorrow'
  ];
  
  const lowerContent = content.toLowerCase();
  return urgencyWords.filter(word => lowerContent.includes(word));
}

// Generate Cadence Matrix integration data
function generateCadenceIntegration(messages) {
  const contactGroups = {};
  
  // Group messages by contact
  messages.forEach(msg => {
    if (!contactGroups[msg.contactName]) {
      contactGroups[msg.contactName] = {
        name: msg.contactName,
        linkedinMessages: [],
        lastInteraction: null,
        responseRate: 0,
        businessRelevance: 0,
        sentiment: 'neutral'
      };
    }
    
    contactGroups[msg.contactName].linkedinMessages.push(msg);
    
    // Update contact-level metrics
    const contact = contactGroups[msg.contactName];
    contact.lastInteraction = msg.date > (contact.lastInteraction || 0) ? msg.date : contact.lastInteraction;
    contact.businessRelevance = Math.max(contact.businessRelevance, msg.businessRelevance);
    
    // Calculate response rate
    const responses = contact.linkedinMessages.filter(m => m.responseIndicator).length;
    contact.responseRate = responses / contact.linkedinMessages.length;
  });
  
  return {
    uniqueContacts: Object.keys(contactGroups).length,
    totalMessages: messages.length,
    avgBusinessRelevance: messages.reduce((sum, m) => sum + m.businessRelevance, 0) / messages.length,
    contactData: contactGroups,
    integrationDate: new Date().toISOString()
  };
}

// Export for use in Cadence Matrix
function updateCadenceMatrix() {
  const result = processLinkedInMessages();
  
  if (result) {
    console.log('🎯 Ready to integrate with Cadence Matrix!');
    console.log('📋 Next steps:');
    console.log('   1. Update CadenceMatrix.jsx to load LinkedIn messages');
    console.log('   2. Add cross-channel timeline view');
    console.log('   3. Update API endpoint to serve integrated data');
  }
}

// Run if called directly
if (require.main === module) {
  updateCadenceMatrix();
}

module.exports = {
  processLinkedInMessages,
  updateCadenceMatrix,
  analyzeSentiment,
  scoreBusinessRelevance
};