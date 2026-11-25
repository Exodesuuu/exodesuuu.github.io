# James Mesa Portfolio - Manual Image Catalog Refresher
# Run this script anytime you add, remove, rename, or re-sort images inside the 'images/' folder.
# It scans all subfolders and automatically updates 'data.js' so your website displays the latest files!
param(
    [switch]$NoPause
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptPath
$imagesDir = Join-Path $repoRoot "images"
$dataJsPath = Join-Path $repoRoot "data.js"

Add-Type -AssemblyName System.Drawing

function Get-DateTaken {
    param([string]$FilePath)
    $img = $null
    try {
        $img = [System.Drawing.Image]::FromFile($FilePath)
        $prop = $img.GetPropertyItem(36867) # PropertyTagExifDTOrig
        $dateString = [System.Text.Encoding]::ASCII.GetString($prop.Value)
        $dateTaken = [datetime]::ParseExact($dateString.Substring(0, 19), "yyyy:MM:dd HH:mm:ss", $null)
        $img.Dispose()
        return $dateTaken
    } catch {
        if ($null -ne $img) { $img.Dispose() }
        return (Get-Item -LiteralPath $FilePath).LastWriteTime
    }
}

if (-not (Test-Path $imagesDir)) {
    Write-Error "Could not find 'images/' folder in $repoRoot."
    if (-not $NoPause) { Read-Host "Press Enter to exit..." }
    exit 1
}

Write-Host "Scanning 'images/' folder..."
$folders = Get-ChildItem -Path $imagesDir -Directory | Sort-Object Name
$portfolioData = @()
$totalImages = 0

$categoryMap = @{
    "home"       = @{ Name = "Home"; Path = "/home"; IsDesign = $false }
    "new-drop"   = @{ Name = "New Drop"; Path = "/new-drop"; IsDesign = $true }
    "new drop"   = @{ Name = "New Drop"; Path = "/new-drop"; IsDesign = $true }
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
    "gray"       = @{ Name = "Design - Gray"; Path = "/design/gray-custom-jersey-design"; IsDesign = $true }
    "beige"      = @{ Name = "Design - Beige"; Path = "/design/beige-custom-jersey-design"; IsDesign = $true }
    "tshirt"     = @{ Name = "Design - Tshirt"; Path = "/design/tshirt-custom-jersey-design"; IsDesign = $true }
    "poloshirt"  = @{ Name = "Design - Poloshirt"; Path = "/design/poloshirt-custom-jersey-design"; IsDesign = $true }
    "football"   = @{ Name = "Design - Football"; Path = "/design/football-custom-jersey-design"; IsDesign = $true }
    "baseball"   = @{ Name = "Design - Baseball"; Path = "/design/baseball-custom-jersey-design"; IsDesign = $true }
    "hoodie"     = @{ Name = "Design - Hoodie"; Path = "/design/hoodie-custom-jersey-design"; IsDesign = $true }
    "logo"       = @{ Name = "Design - Logo"; Path = "/design/logo-designs"; IsDesign = $true }
}

foreach ($folder in $folders) {
    $folderName = $folder.Name.ToLower()

    # Never index the staging folder
    if ($folderName -eq "unsorted") {
        continue
    }

    $map = $categoryMap[$folderName]
    if (-not $map) {
        $cleanName = (Get-Culture).TextInfo.ToTitleCase($folderName)
        $map = @{
            Name = "Design - $cleanName"
            Path = "/design/$folderName"
            IsDesign = $true
        }
    }
    
    $files = Get-ChildItem -Path $folder.FullName -File -Recurse | Where-Object { 
        $_.Extension -match "\.(jpg|jpeg|png|gif|svg|webp)$" 
    }
    
    $filesWithDates = $files | ForEach-Object {
        [PSCustomObject]@{
            File = $_
            Date = Get-DateTaken $_.FullName
        }
    }
    $sortedFiles = $filesWithDates | Sort-Object Date -Descending | Select-Object -ExpandProperty File
    
    $localPaths = @()
    foreach ($file in $sortedFiles) {
        $rel = $file.FullName.Substring($imagesDir.Length).TrimStart('\', '/').Replace('\', '/')
        $localPaths += "images/$rel"
    }
    
    if ($localPaths.Count -eq 0) {
        continue
    }

    $totalImages += $localPaths.Count
    $entry = [PSCustomObject]@{
        Name = $map.Name
        Path = $map.Path
        IsDesignCategory = $map.IsDesign
        Images = $localPaths
    }
    
    $portfolioData += $entry
    Write-Host "Processed $($folder.Name): Found $($localPaths.Count) images (newest first)."
}

$json = $portfolioData | ConvertTo-Json -Depth 5
$jsContent = "const PORTFOLIO_DATA = $json;"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($dataJsPath, $jsContent, $utf8NoBom)

Write-Host "`nSuccessfully refreshed data.js!" -ForegroundColor Green
Write-Host "Indexed $($portfolioData.Count) categories and $totalImages total designs."
