#!/bin/bash

# TheSalesSherpa Installation Script
# Usage: ./install.sh

echo "🎯 Installing TheSalesSherpa - AI Sales Intelligence Platform"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" &> /dev/null; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
echo ""
echo "📦 Installing client dependencies..."
cd src/client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

# Go back to root directory
cd ../..

echo ""
echo "🎨 Building Tailwind CSS..."
cd src/client
npx tailwindcss -i ./src/index.css -o ./src/output.css --watch=false

cd ../..

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "🚀 To start TheSalesSherpa:"
echo "   npm run dev    # Start both server and client"
echo "   npm run server # Start server only (port 5001)"
echo "   npm run client # Start client only (port 3000)"
echo ""
echo "🌐 Once running, access the platform at:"
echo "   http://localhost:3000"
echo ""
echo "📊 API endpoints will be available at:"
echo "   http://localhost:5001/api"
echo ""
echo "🎯 Ready for your VP Sales demo on February 17th!"
echo "=================================================="