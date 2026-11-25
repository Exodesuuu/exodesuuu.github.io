# James Mesa Portfolio - One-Click Photo Upload & SEO Rebuild Script
# 1. Auto-sorts any new basketball jersey photos placed in images\unsorted\
# 2. Refreshes data.js with all photos sorted newest-first
# 3. Regenerates sitemap.xml with today's date & all image entries
# 4. Rebuilds production index.html and app.js

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptPath

Write-Host "=== James Mesa Website Updater ===" -ForegroundColor Cyan

# Step 1: Auto-sort any unsorted basketball jersey images
& (Join-Path $scriptPath "auto_sort_colors.ps1") -NoPause

# Step 2: Refresh catalog (data.js)
& (Join-Path $scriptPath "refresh_catalog.ps1") -NoPause

# Step 3: Regenerate sitemap.xml
& (Join-Path $repoRoot "generate_sitemap.ps1")

# Step 4: Rebuild production index.html & app.js
& (Join-Path $repoRoot "build.ps1")

Write-Host "`nAll done! Commit and push the updated files to GitHub to publish live on www.jamesmesa.online." -ForegroundColor Green
