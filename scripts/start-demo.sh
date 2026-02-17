#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# TheSalesSherpa Demo Startup Script
# ═══════════════════════════════════════════════════════════════════════════
# 
# This script starts the TheSalesSherpa platform in demo mode.
# Perfect for the Feb 17, 2026 VP Sales presentation!
#
# Usage:
#   ./scripts/start-demo.sh           # Full stack with Docker
#   ./scripts/start-demo.sh --local   # Local development mode
#
# ═══════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo ""
echo "🎯 ═══════════════════════════════════════════════════════════════════"
echo "   TheSalesSherpa - Enterprise Sales Intelligence Platform"
echo "   ═══════════════════════════════════════════════════════════════════"
echo ""
echo "   \"Monaco power at HubSpot pricing\""
echo ""
echo "   Version: 1.0.0"
echo "   Demo Mode: ENABLED"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Check for --local flag
if [[ "$1" == "--local" ]]; then
    echo "📦 Starting in LOCAL DEVELOPMENT mode..."
    echo ""
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Check Node version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ "$NODE_VERSION" -lt 18 ]]; then
        echo "❌ Node.js 18+ required. Current: $(node -v)"
        exit 1
    fi
    
    echo "✅ Node.js $(node -v) detected"
    echo ""
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        echo "📥 Installing server dependencies..."
        npm install
    fi
    
    if [[ ! -d "src/client/node_modules" ]]; then
        echo "📥 Installing client dependencies..."
        cd src/client && npm install && cd ../..
    fi
    
    # Create .env if not exists
    if [[ ! -f ".env" ]]; then
        echo "📝 Creating .env file from template..."
        cp .env.example .env
    fi
    
    echo ""
    echo "🚀 Starting development servers..."
    echo ""
    echo "   API Server:  http://localhost:5001"
    echo "   React App:   http://localhost:3000"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════"
    echo ""
    
    # Set demo mode
    export DEMO_MODE=true
    
    # Start both servers
    npm run dev
    
else
    echo "🐳 Starting with DOCKER COMPOSE..."
    echo ""
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found. Please install Docker Desktop"
        exit 1
    fi
    
    # Check for Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose not found"
        exit 1
    fi
    
    echo "✅ Docker detected"
    echo ""
    
    # Create .env if not exists
    if [[ ! -f ".env" ]]; then
        echo "📝 Creating .env file from template..."
        cp .env.example .env
    fi
    
    # Build and start containers
    echo "📦 Building containers..."
    docker compose -f docker/docker-compose.yml build
    
    echo ""
    echo "🚀 Starting services..."
    docker compose -f docker/docker-compose.yml up -d
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check health
    echo ""
    echo "🔍 Checking service health..."
    
    API_HEALTH=$(curl -s http://localhost:5001/health 2>/dev/null || echo '{"status":"error"}')
    if echo "$API_HEALTH" | grep -q "healthy"; then
        echo "   ✅ API Server: healthy"
    else
        echo "   ⚠️  API Server: starting..."
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════"
    echo ""
    echo "🎯 TheSalesSherpa is ready!"
    echo ""
    echo "   🌐 Dashboard:     http://localhost:3000"
    echo "   🔌 API Server:    http://localhost:5001"
    echo "   📊 API Docs:      http://localhost:5001/api"
    echo ""
    echo "   📁 PostgreSQL:    localhost:5432"
    echo "   📁 Redis:         localhost:6379"
    echo "   📁 Neo4j:         localhost:7474"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════"
    echo ""
    echo "📌 Demo Accounts Ready:"
    echo "   • WPP (Urgency: 95) - Hot opportunity"
    echo "   • Battelle (Urgency: 92) - DOE contract renewal"
    echo "   • Salesforce (Urgency: 78) - Partnership potential"
    echo ""
    echo "🎤 Ready for Feb 17 VP Sales Demo!"
    echo ""
    echo "Commands:"
    echo "   Stop:   docker compose -f docker/docker-compose.yml down"
    echo "   Logs:   docker compose -f docker/docker-compose.yml logs -f"
    echo ""
fi
