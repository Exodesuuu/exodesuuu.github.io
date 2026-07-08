# Function to escape XML special characters
function Escape-XmlString ($string) {
    if ($null -eq $string) { return "" }
    return $string.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

$dataPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\data.js"
$sitemapPath = "C:\Users\James\Documents\GitHub\Portfolio-James-Mesa\sitemap.xml"

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
            
            # Format the loc URL correctly
            # Note: We need to replace spaces with %20 for valid XML URL encoding
            $encodedImgPath = $imgPath.Replace(" ", "%20")
            $imgUrl = "https://www.jamesmesa.online/$encodedImgPath"
            
            # Escape strings for valid XML
            $escapedImgUrl = Escape-XmlString $imgUrl
            $escapedTitle = Escape-XmlString "$title Jersey Design"
            
            $xmlBody += "`r`n    <image:image>"
            $xmlBody += "`r`n      <image:loc>$escapedImgUrl</image:loc>"
            $xmlBody += "`r`n      <image:title>$escapedTitle</image:title>"
            $xmlBody += "`r`n    </image:image>"
        }
    }

    $xmlFooter = "`r`n  </url>`r`n</urlset>"
    
    $finalXml = $xmlHeader + $xmlBody + $xmlFooter
    
    # Write UTF-8 WITHOUT a BOM using .NET IO class
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($sitemapPath, $finalXml, $utf8NoBom)
    
    Write-Host "Successfully generated Image Sitemap at sitemap.xml with $($seenImages.Count) images!"
} else {
    Write-Warning "data.js not found! Cannot generate image sitemap."
}
