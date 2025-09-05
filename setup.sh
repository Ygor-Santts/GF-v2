#!/usr/bin/env bash
set -e

# Simple local runner without Docker
echo "==> Installing backend deps"
( cd backend && cp -n .env.example .env || true && npm install )

echo "==> Installing frontend deps"
( cd frontend && npm install )

echo ""
echo "All set."
echo "Run these two terminals:"
echo "  1) cd backend && npm run dev    # API http://localhost:4000"
echo "  2) cd frontend && npm run dev   # WEB http://localhost:5173"
