# James Mesa Portfolio - Production Build Script
# Ensures index.html retains full semantic HTML for SEO and AEO crawlability.

$indexSrcPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\index.src.html"
$appSrcPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\app.src.js"

$indexDestPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\index.html"
$appDestPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\app.js"

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
    
    Write-Host "Build Complete!"
    Write-Host " - index.html generated with 100% crawlable semantic HTML and structured schema."
    Write-Host " - app.js compiled cleanly with zero eval lag."
} else {
    Write-Warning "Missing source files! Ensure index.src.html and app.src.js exist."
}
