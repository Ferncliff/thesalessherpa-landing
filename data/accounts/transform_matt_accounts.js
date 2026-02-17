const fs = require('fs');

// Read the raw Excel data
const rawData = JSON.parse(fs.readFileSync('matt_fa_accounts_updated.json', 'utf8'));

// Transform the data to match TheSalesSherpa account structure
const transformedAccounts = rawData.map((item, index) => {
  const companyName = item["Uber"]; // The company name column
  const website = item["www.uber.com"]; // The website column
  
  // Extract domain from website
  let domain = website;
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    domain = new URL(domain).hostname;
  }
  if (domain.startsWith('www.')) {
    domain = domain.substring(4);
  }
  
  return {
    id: `matt_acc_${String(index + 1).padStart(3, '0')}`,
    name: companyName,
    domain: domain,
    website: website,
    industry: "Unknown", // Will need to be enriched later
    revenue: "Unknown",
    employees: null,
    status: "prospect", // Matt's territory prospects
    priority: "medium", // Default, can be updated based on urgency scoring
    urgencyScore: null, // To be calculated
    lastActivity: null,
    source: "Matt FA Territory List",
    territories: ["First Advantage"],
    relationships: [],
    insights: [],
    tags: ["FA Territory", "Matt Edwards"]
  };
});

// Sort alphabetically by company name
transformedAccounts.sort((a, b) => a.name.localeCompare(b.name));

// Add some metadata
const accountsData = {
  metadata: {
    source: "Matt Edwards FA Territory List",
    lastUpdated: new Date().toISOString(),
    totalAccounts: transformedAccounts.length,
    territory: "First Advantage",
    owner: "Matt Edwards"
  },
  accounts: transformedAccounts
};

// Save the transformed data
fs.writeFileSync('matt_fa_accounts_formatted.json', JSON.stringify(accountsData, null, 2));

console.log(`✅ Transformed ${transformedAccounts.length} accounts`);
console.log('✅ Data saved to matt_fa_accounts_formatted.json');

// Show some sample data
console.log('\nSample accounts:');
console.log(JSON.stringify(transformedAccounts.slice(0, 3), null, 2));