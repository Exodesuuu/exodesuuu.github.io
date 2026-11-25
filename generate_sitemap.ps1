# Function to escape XML special characters
function Escape-XmlString ($string) {
    if ($null -eq $string) { return "" }
    return $string.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

$repoRoot = $PSScriptRoot
$dataPath = Join-Path $repoRoot "data.js"
$sitemapPath = Join-Path $repoRoot "sitemap.xml"
$today = (Get-Date).ToString("yyyy-MM-dd")

if (Test-Path $dataPath) {
    $content = Get-Content $dataPath -Encoding UTF8 -Raw
    
    # Extract image paths (e.g., "images/beige/WOODBRIDGE.jpg")
    $matches = [regex]::Matches($content, '"(images/[^"]+\.(jpg|jpeg|png|webp|gif|svg))"')
    
    $xmlHeader = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.jamesmesa.online/</loc>
    <lastmod>$today</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
"@

    $xmlBody = ""
    $seenImages = @{}

    foreach ($match in $matches) {
        $imgPath = $match.Groups[1].Value
        
        if (-not $seenImages.ContainsKey($imgPath)) {
            $seenImages[$imgPath] = $true
            
            $fileName = $imgPath.Split('/')[-1]
            $title = $fileName.SubString(0, $fileName.LastIndexOf('.'))
            
            $encodedImgPath = $imgPath.Replace(" ", "%20")
            $imgUrl = "https://www.jamesmesa.online/$encodedImgPath"
            
            $escapedImgUrl = Escape-XmlString $imgUrl
            $escapedTitle = Escape-XmlString "$title Custom Sportswear Design by James Mesa"
            
            $xmlBody += "`r`n    <image:image>"
            $xmlBody += "`r`n      <image:loc>$escapedImgUrl</image:loc>"
            $xmlBody += "`r`n      <image:title>$escapedTitle</image:title>"
            $xmlBody += "`r`n    </image:image>"
        }
    }

    $xmlFooter = @"
  </url>
  <url>
    <loc>https://www.jamesmesa.online/resume-project/index.html</loc>
    <lastmod>$today</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.jamesmesa.online/llms.txt</loc>
    <lastmod>$today</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.jamesmesa.online/llms-full.txt</loc>
    <lastmod>$today</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
"@
    
    $finalXml = $xmlHeader + $xmlBody + "`r`n" + $xmlFooter
    
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($sitemapPath, $finalXml, $utf8NoBom)
    
    Write-Host "Successfully generated Image & Content Sitemap at sitemap.xml with $($seenImages.Count) images (lastmod $today)!" -ForegroundColor Green
} else {
    Write-Warning "data.js not found in $repoRoot! Cannot generate image sitemap."
}
