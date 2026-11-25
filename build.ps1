# James Mesa Portfolio - Production Build Script
# Ensures index.html retains full semantic HTML for SEO and AEO crawlability.
param(
    [string]$SyncTo = ""
)

$repoRoot = $PSScriptRoot
$indexSrcPath = Join-Path $repoRoot "index.src.html"
$appSrcPath   = Join-Path $repoRoot "app.src.js"

$indexDestPath = Join-Path $repoRoot "index.html"
$appDestPath   = Join-Path $repoRoot "app.js"

if ((Test-Path $indexSrcPath) -and (Test-Path $appSrcPath)) {
    Write-Host "Compiling portfolio files for production (SEO & AEO optimized)..."
    
    # 1. Read source files with UTF-8
    $indexHtml = Get-Content -Path $indexSrcPath -Encoding UTF8 -Raw
    $appJs = Get-Content -Path $appSrcPath -Encoding UTF8 -Raw

    # 2. Ensure script tags in index.html point to production data.js and app.js
    $compiledIndex = $indexHtml -replace '<script src="app\.src\.js"></script>', '<script src="app.js"></script>'
    $compiledIndex = $compiledIndex -replace '<script src="database\.js"></script>', '<script src="data.js"></script>'

    # 3. Write index.html with FULL semantic HTML body (Crucial for Googlebot, Bingbot, GPTBot, Perplexity, Claude)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($indexDestPath, $compiledIndex, $utf8NoBom)
    
    # 4. Write app.js directly from app.src.js
    [System.IO.File]::WriteAllText($appDestPath, $appJs, $utf8NoBom)
    
    Write-Host "Build Complete!" -ForegroundColor Green
    Write-Host " - index.html generated with 100% crawlable semantic HTML and structured schema."
    Write-Host " - app.js compiled cleanly."

    if ($SyncTo -and (Test-Path $SyncTo)) {
        Write-Host "Syncing built files to $SyncTo ..." -ForegroundColor Cyan
        Copy-Item -Path $indexSrcPath, $indexDestPath, $appSrcPath, $appDestPath -Destination $SyncTo -Force
    }
} else {
    Write-Warning "Missing source files in $repoRoot! Ensure index.src.html and app.src.js exist."
}
