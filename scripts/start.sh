#!/bin/bash
set -e

echo "🚀 Starting ScoutWo services..."

# Start the worker in the background
echo "Starting scraper worker..."
npm run scraper:worker &
WORKER_PID=$!

# Start the Next.js server
echo "Starting Next.js server..."
node server.js &
SERVER_PID=$!

# Function to handle shutdown
cleanup() {
    echo "Shutting down..."
    kill $WORKER_PID $SERVER_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Wait for both processes
wait $SERVER_PID $WORKER_PID
