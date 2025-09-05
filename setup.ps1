# Simple local runner for Windows (PowerShell)
Set-StrictMode -Version Latest

Write-Host "==> Installing backend deps"
Copy-Item -Path "backend/.env.example" -Destination "backend/.env" -ErrorAction SilentlyContinue
Push-Location backend
npm install
Pop-Location

Write-Host "==> Installing frontend deps"
Push-Location frontend
npm install
Pop-Location

Write-Host ""
Write-Host "All set."
Write-Host "Open two terminals and run:"
Write-Host "  1) cd backend ; npm run dev    # API http://localhost:4000"
Write-Host "  2) cd frontend ; npm run dev   # WEB http://localhost:5173"
