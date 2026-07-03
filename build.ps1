$indexSrcPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\index.src.html"
$appSrcPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\app.src.js"

$indexDestPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\index.html"
$appDestPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\app.js"

if ((Test-Path $indexSrcPath) -and (Test-Path $appSrcPath)) {
    # 1. Read files forcing UTF8 encoding
    $indexHtml = Get-Content -Path $indexSrcPath -Encoding UTF8 -Raw
    $appJs = Get-Content -Path $appSrcPath -Encoding UTF8 -Raw

    # 2. Extract body HTML
    $startTag = '<body class="dark-mode">'
    $endTag = '<!-- Script Modules -->'
    
    $startIndex = $indexHtml.IndexOf($startTag) + $startTag.Length
    $endIndex = $indexHtml.IndexOf($endTag)
    
    if ($startIndex -ge 0 -and $endIndex -ge 0) {
        $bodyHtml = $indexHtml.Substring($startIndex, $endIndex - $startIndex)
        $bodyBase64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($bodyHtml))
        
        # 3. Combine JS code with HTML injection (in-memory) using robust TextDecoder
        $htmlInjection = "document.addEventListener('DOMContentLoaded', () => {`r`n  document.body.innerHTML = new TextDecoder().decode(Uint8Array.from(window.atob('$bodyBase64'), c => c.charCodeAt(0)));"
        $combinedJs = $appJs.Replace("document.addEventListener('DOMContentLoaded', () => {", $htmlInjection)
        
        # 4. Obfuscate (Base64 scramble) the entire combined JavaScript
        $finalBase64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($combinedJs))
        $obfuscatedJs = "eval(new TextDecoder().decode(Uint8Array.from(window.atob('$finalBase64'), c => c.charCodeAt(0))));"
        
        # 5. Output compiled app.js
        Set-Content -Path $appDestPath -Value $obfuscatedJs -Encoding UTF8
        
        # 6. Output compiled index.html (with empty body)
        $blankIndex = $indexHtml.Substring(0, $startIndex) + "`r`n  " + $endTag + $indexHtml.Substring($endIndex)
        
        # Fix script references in index.html to ensure we load app.js and data.js
        $blankIndex = $blankIndex -replace '<script src="app.src.js"></script>', '<script src="app.js"></script>'
        $blankIndex = $blankIndex -replace '<script src="database.js"></script>', '<script src="data.js"></script>'
        
        Set-Content -Path $indexDestPath -Value $blankIndex -Encoding UTF8
        
        Write-Host "Build Complete!"
        Write-Host "HTML and JS compiled, combined, and scrambled successfully using UTF-8 TextDecoder."
    } else {
        Write-Warning "Could not find body tags in index.src.html!"
    }
} else {
    Write-Warning "Missing source files! Ensure index.src.html and app.src.js exist."
}
