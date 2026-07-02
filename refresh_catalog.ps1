# James Mesa Portfolio - Manual Image Catalog Refresher
# Double-click or run this script anytime you manually add, remove, rename, or re-sort images inside the 'images/' folder.
# It will scan all your subfolders and automatically update the 'data.js' database so your website displays the correct files instantly!

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$imagesDir = Join-Path $scriptPath "images"
$dataJsPath = Join-Path $scriptPath "data.js"

if (-not (Test-Path $imagesDir)) {
    Write-Error "Could not find 'images/' folder in $scriptPath. Please make sure this script is placed in the same folder as index.html."
    Read-Host "Press Enter to exit..."
    exit
}

Write-Host "Scanning 'images/' folder..."
$folders = Get-ChildItem -Path $imagesDir -Directory
$portfolioData = @()

# We map folder names to clean category names and path values
$categoryMap = @{
    "home"       = @{ Name = "Home"; Path = "/home"; IsDesign = $false }
    "black"      = @{ Name = "Design - Black"; Path = "/design/black-custom-jersey-design"; IsDesign = $true }
    "white"      = @{ Name = "Design - White"; Path = "/design/white-custom-jersey-design"; IsDesign = $true }
    "blue"       = @{ Name = "Design - Blue"; Path = "/design/blue-custom-jersey-design"; IsDesign = $true }
    "red"        = @{ Name = "Design - Red"; Path = "/design/red-custom-jersey-design"; IsDesign = $true }
    "green"      = @{ Name = "Design - Green"; Path = "/design/green-custom-jersey-design"; IsDesign = $true }
    "yellow"     = @{ Name = "Design - Yellow"; Path = "/design/yellow-custom-jersey-design"; IsDesign = $true }
    "orange"     = @{ Name = "Design - Orange"; Path = "/design/orange-custom-jersey-design"; IsDesign = $true }
    "purple"     = @{ Name = "Design - Purple"; Path = "/design/purple-custom-jersey-design"; IsDesign = $true }
    "pink"       = @{ Name = "Design - Pink"; Path = "/design/pink-custom-jersey-design"; IsDesign = $true }
    "cyan"       = @{ Name = "Design - Cyan"; Path = "/design/cyan-custom-jersey-design"; IsDesign = $true }
    "beige"      = @{ Name = "Design - Beige"; Path = "/design/beige-custom-jersey-design"; IsDesign = $true }
    "tshirt"     = @{ Name = "Design - Tshirt"; Path = "/design/tshirt-custom-jersey-design"; IsDesign = $true }
    "poloshirt"  = @{ Name = "Design - Poloshirt"; Path = "/design/poloshirt-custom-jersey-design"; IsDesign = $true }
    "logo"       = @{ Name = "Design - Logo"; Path = "/design/logo-designs"; IsDesign = $true }
}

# Process each folder
foreach ($folder in $folders) {
    $folderName = $folder.Name.ToLower()
    $map = $categoryMap[$folderName]
    
    # If not in map, build a fallback layout
    if (-not $map) {
        $cleanName = (Get-Culture).TextInfo.ToTitleCase($folderName)
        $map = @{
            Name = "Design - $cleanName"
            Path = "/design/$folderName"
            IsDesign = $true
        }
    }
    
    # Scan for image files recursively to capture subfolder assets
    $files = Get-ChildItem -Path $folder.FullName -File -Recurse | Where-Object { 
        $_.Extension -match "\.(jpg|jpeg|png|gif|svg|webp)$" 
    }
    
    # Sort files by CreationTime descending so the newest files are placed at the top of the array!
    $sortedFiles = $files | Sort-Object CreationTime -Descending
    
    $localPaths = @()
    foreach ($file in $sortedFiles) {
        # Determine if file is inside a subfolder (e.g. tshirt/sports/)
        $subName = Split-Path (Split-Path $file.FullName -Parent) -Leaf
        if ($subName -eq $folder.Name) {
            $localPaths += "images/$($folder.Name)/$($file.Name)"
        } else {
            # Normalize path delimiters for browser loading
            $localPaths += "images/$($folder.Name)/$subName/$($file.Name)"
        }
    }
    
    $entry = [PSCustomObject]@{
        Name = $map.Name
        Path = $map.Path
        IsDesignCategory = $map.IsDesign
        Images = $localPaths
    }
    
    $portfolioData += $entry
    Write-Host "Processed $($folder.Name): Found $($localPaths.Count) images (newest first)."
}

# Convert to JSON and save
$json = $portfolioData | ConvertTo-Json -Depth 5
$jsContent = "const PORTFOLIO_DATA = $json;"
Set-Content -Path $dataJsPath -Value $jsContent -Encoding utf8

Write-Host "`nSuccessfully refreshed data.js!" -ForegroundColor Green
Write-Host "You have $($portfolioData.Count) categories indexed in your catalog."
Start-Sleep -Seconds 2
