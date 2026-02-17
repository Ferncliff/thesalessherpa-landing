#!/bin/bash

# TheSalesSherpa Startup Script
# Usage: ./start.sh [mode]
# Modes: dev (default), server, client, prod

MODE=${1:-dev}

echo "🎯 Starting TheSalesSherpa in $MODE mode..."

case $MODE in
    "dev")
        echo "🚀 Starting development mode (server + client)"
        npm run dev
        ;;
    "server")
        echo "⚙️  Starting server only"
        npm run server
        ;;
    "client")
        echo "🎨 Starting client only"
        npm run client
        ;;
    "prod")
        echo "🏭 Starting production mode"
        NODE_ENV=production npm start
        ;;
    *)
        echo "❌ Unknown mode: $MODE"
        echo "Available modes: dev, server, client, prod"
        exit 1
        ;;
esac