#!/usr/bin/env node

/**
 * TheSalesSherpa - Setup Test Script
 * Verifies that the installation completed successfully
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🎯 TheSalesSherpa - Setup Verification');
console.log('====================================');

let errors = 0;

// Test 1: Check required files exist
console.log('\n📁 Checking required files...');
const requiredFiles = [
    'package.json',
    'src/server/app.js',
    'src/client/package.json',
    'src/client/src/App.js',
    '.env'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        errors++;
    }
});

// Test 2: Check Node.js version
console.log('\n🟢 Checking Node.js version...');
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

// Test 3: Test server startup (quick check)
console.log('\n⚙️ Testing server files...');
try {
    require('./src/server/app.js');
    console.log('✅ Server files load correctly');
} catch (error) {
    console.log('❌ Server files have issues:', error.message);
    errors++;
}

// Test 4: Check package dependencies
console.log('\n📦 Checking main dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['express', 'cors', 'helmet'];

requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}`);
    } else {
        console.log(`❌ ${dep} - NOT FOUND`);
        errors++;
    }
});

// Test 5: Check client dependencies
console.log('\n🎨 Checking client dependencies...');
try {
    const clientPackageJson = JSON.parse(fs.readFileSync('src/client/package.json', 'utf8'));
    const requiredClientDeps = ['react', 'react-dom', 'tailwindcss'];
    
    requiredClientDeps.forEach(dep => {
        if (clientPackageJson.dependencies && clientPackageJson.dependencies[dep]) {
            console.log(`✅ ${dep}`);
        } else {
            console.log(`❌ ${dep} - NOT FOUND`);
            errors++;
        }
    });
} catch (error) {
    console.log('❌ Client package.json issues:', error.message);
    errors++;
}

// Summary
console.log('\n📊 Setup Verification Summary');
console.log('============================');

if (errors === 0) {
    console.log('🎉 SUCCESS! TheSalesSherpa is ready to launch');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. ./start.sh dev    # Start development mode');
    console.log('   2. Open http://localhost:3000');
    console.log('   3. Begin demo preparation');
    console.log('');
    console.log('🎯 Ready for VP Sales demo on February 17th!');
    process.exit(0);
} else {
    console.log(`❌ ISSUES FOUND: ${errors} problems detected`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Run ./install.sh to reinstall dependencies');
    console.log('   2. Check Node.js version (requires 18+)');
    console.log('   3. Verify all files are present');
    console.log('');
    process.exit(1);
}