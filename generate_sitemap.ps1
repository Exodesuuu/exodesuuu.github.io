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
    <loc>https://jamesmesa.github.io/Portfolio-James-Mesa/</loc>
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
            $imgUrl = "https://jamesmesa.github.io/Portfolio-James-Mesa/$encodedImgPath"
            
            $xmlBody += "`r`n    <image:image>"
            $xmlBody += "`r`n      <image:loc>$imgUrl</image:loc>"
            $xmlBody += "`r`n      <image:title>$title Jersey Design</image:title>"
            $xmlBody += "`r`n    </image:image>"
        }
    }

    $xmlFooter = "`r`n  </url>`r`n</urlset>"
    
    $finalXml = $xmlHeader + $xmlBody + $xmlFooter
    Set-Content -Path $sitemapPath -Value $finalXml -Encoding UTF8
    
    Write-Host "Successfully generated Image Sitemap at sitemap.xml with $($seenImages.Count) images!"
} else {
    Write-Warning "data.js not found! Cannot generate image sitemap."
}
