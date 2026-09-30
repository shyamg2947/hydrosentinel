#!/bin/bash

# HydroSentinel - 1-Click Platform Startup Script
# Works standalone in standard VS Code / Terminal without Antigravity

echo "========================================================"
echo "⚡ Starting HydroSentinel Platform on your Mac..."
echo "========================================================"

# 1. Start MongoDB in background
echo "📦 [1/3] Starting MongoDB database daemon..."
nohup /Users/niggacaster/mongodb/bin/mongod --dbpath /Users/niggacaster/mongodb_data > /dev/null 2>&1 &
sleep 2

# Verify MongoDB is responding
if nc -zv 127.0.0.1 27017 2>&1 | grep -q 'succeeded'; then
  echo "✅ MongoDB is listening on port 27017"
else
  echo "⚠️  Waiting for MongoDB on port 27017..."
  sleep 2
fi

# 2. Start Backend API in background
echo "🚀 [2/3] Starting Backend API Server (Node/Express)..."
(cd server && npm run dev) &
BACKEND_PID=$!

# 3. Start Frontend Client in background
echo "💻 [3/3] Starting Frontend Client (React/Vite)..."
(cd client && npm run dev) &
FRONTEND_PID=$!

# Wait 3 seconds for Vite to boot and open default browser automatically
sleep 3
echo "🌐 Opening HydroSentinel in your browser..."
open "http://localhost:3000"

echo ""
echo "========================================================"
echo "🎉 HydroSentinel Platform is LIVE!"
echo "👉 Frontend App: http://localhost:3000"
echo "👉 Backend API:  http://localhost:5001"
echo "👉 To stop all servers: Press Ctrl + C in this terminal"
echo "========================================================"

# Trap SIGINT (Ctrl+C) to shut down child processes cleanly
trap "echo 'Shutting down servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
