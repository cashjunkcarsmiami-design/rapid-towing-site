$ErrorActionPreference = "Stop"

Write-Host "Deploying Rapid Towing site to Vercel..."
Write-Host "Source: $PSScriptRoot"

vercel.cmd deploy "$PSScriptRoot" --prod

