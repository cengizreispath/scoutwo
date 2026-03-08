#!/bin/bash

# ScoutWo Deployment Validation Script
# Checks if all services are running and healthy

set -e

echo "🔍 ScoutWo Deployment Validation"
echo "================================"

# Check if Docker Compose is running
echo ""
echo "📦 Checking Docker Compose services..."
if ! docker-compose ps | grep -q "Up"; then
  echo "❌ Docker Compose services not running!"
  echo "Run: docker-compose up -d"
  exit 1
fi

# Check web service
echo ""
echo "🌐 Checking web service..."
if docker-compose ps | grep "web" | grep -q "Up"; then
  echo "✅ Web service is running"
else
  echo "❌ Web service is not running"
  exit 1
fi

# Check worker service
echo ""
echo "⚙️  Checking worker service..."
if docker-compose ps | grep "worker" | grep -q "Up"; then
  echo "✅ Worker service is running"
else
  echo "❌ Worker service is not running"
  exit 1
fi

# Check Redis service
echo ""
echo "🔴 Checking Redis service..."
if docker-compose ps | grep "redis" | grep -q "Up"; then
  echo "✅ Redis service is running"
  
  # Test Redis connection
  if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is responding to ping"
  else
    echo "⚠️  Redis is running but not responding"
  fi
else
  echo "❌ Redis service is not running"
  exit 1
fi

# Check worker logs for startup
echo ""
echo "📋 Checking worker logs..."
WORKER_LOGS=$(docker-compose logs worker --tail=10)
if echo "$WORKER_LOGS" | grep -q "ScoutWo scraper worker started"; then
  echo "✅ Worker has started successfully"
else
  echo "⚠️  Worker may not have started properly"
  echo "Last 5 lines of worker logs:"
  docker-compose logs worker --tail=5
fi

# Check for errors in worker logs
if echo "$WORKER_LOGS" | grep -qi "error\|failed"; then
  echo "⚠️  Errors detected in worker logs:"
  echo "$WORKER_LOGS" | grep -i "error\|failed"
else
  echo "✅ No errors in worker logs"
fi

echo ""
echo "================================"
echo "✅ All services are running!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 (or your domain)"
echo "2. Create a search with brands"
echo "3. Click 'Ürünleri Listele' button"
echo "4. Check worker logs: docker-compose logs -f worker"
