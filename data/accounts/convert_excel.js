const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('matt_fa_accounts_updated.xlsx');

// Get the first sheet name
const sheetName = workbook.SheetNames[0];
console.log('Sheet name:', sheetName);

// Get the worksheet
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log('Total records:', jsonData.length);
console.log('Columns:', Object.keys(jsonData[0] || {}));
console.log('\nFirst 3 records:');
console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));

// Save to JSON file
fs.writeFileSync('matt_fa_accounts_updated.json', JSON.stringify(jsonData, null, 2));
console.log('\n✅ Data saved to matt_fa_accounts_updated.json');

// Save to CSV
const csv = XLSX.utils.sheet_to_csv(worksheet);
fs.writeFileSync('matt_fa_accounts_updated.csv', csv);
console.log('✅ Data saved to matt_fa_accounts_updated.csv');