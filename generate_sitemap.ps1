# Function to escape XML special characters
function Escape-XmlString ($string) {
    if ($null -eq $string) { return "" }
    return $string.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

$dataPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\data.js"
$sitemapPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\sitemap.xml"
$today = (Get-Date).ToString("yyyy-MM-dd")

if (Test-Path $dataPath) {
    $content = Get-Content $dataPath -Raw
    
    # Simple regex to extract image paths (e.g., "images/beige/WOODBRIDGE.jpg")
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
        
        # Avoid duplicate image entries
        if (-not $seenImages.ContainsKey($imgPath)) {
            $seenImages[$imgPath] = $true
            
            # Extract image filename to use as title
            $fileName = $imgPath.Split('/')[-1]
            $title = $fileName.SubString(0, $fileName.LastIndexOf('.'))
            
            # Format the loc URL correctly with URL-encoded spaces
            $encodedImgPath = $imgPath.Replace(" ", "%20")
            $imgUrl = "https://www.jamesmesa.online/$encodedImgPath"
            
            # Escape strings for valid XML
            $escapedImgUrl = Escape-XmlString $imgUrl
            $escapedTitle = Escape-XmlString "$title Custom Sportswear Design"
            
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
</urlset>
"@
    
    $finalXml = $xmlHeader + $xmlBody + "`r`n" + $xmlFooter
    
    # Write UTF-8 WITHOUT a BOM using .NET IO class
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($sitemapPath, $finalXml, $utf8NoBom)
    
    Write-Host "Successfully generated Image & Content Sitemap at sitemap.xml with $($seenImages.Count) images and updated metadata!"
} else {
    Write-Warning "data.js not found! Cannot generate image sitemap."
}
