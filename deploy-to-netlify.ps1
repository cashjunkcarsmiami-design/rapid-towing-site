param(
  [string]$SiteId = "adf727a0-8391-4def-9d96-f250d2b18c7b",
  [string]$AppDataDir = "$PSScriptRoot\..\netlify-appdata"
)

$ErrorActionPreference = "Stop"

$env:NETLIFY_CLI_DISABLE_UPDATE_CHECK = "1"
$env:APPDATA = $AppDataDir
New-Item -ItemType Directory -Path $env:APPDATA -Force | Out-Null

Write-Host "Deploying Rapid Towing site to Netlify..."
Write-Host "Site ID: $SiteId"
Write-Host "Source: $PSScriptRoot"

netlify.cmd deploy `
  --dir "$PSScriptRoot" `
  --site "$SiteId" `
  --prod

