# James Mesa Portfolio - Automatic Color Sorter!
# Place new, unsorted basketball jersey images into 'images\unsorted' and run this script (or run update_website.ps1).
# It scans the center of each image, detects the dominant jersey color, and moves it into the matching folder safely.
param(
    [switch]$NoPause
)

Add-Type -AssemblyName System.Drawing

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptPath
$unsortedDir = Join-Path $repoRoot "images\unsorted"
$imagesDir = Join-Path $repoRoot "images"

if (-not (Test-Path $unsortedDir)) {
    New-Item -ItemType Directory -Path $unsortedDir | Out-Null
    Write-Host "Created 'images\unsorted'. Place new jersey images there, then run this script again." -ForegroundColor Cyan
    if (-not $NoPause) { Read-Host "Press Enter to exit..." }
    exit 0
}

$files = Get-ChildItem -Path $unsortedDir -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }
if ($files.Count -eq 0) {
    Write-Host "No images found in 'images\unsorted'." -ForegroundColor Yellow
    if (-not $NoPause) { Read-Host "Press Enter to exit..." }
    exit 0
}

$palette = @(
    @{ Name = "beige";  R = 245; G = 245; B = 220 }
    @{ Name = "black";  R = 0;   G = 0;   B = 0 }
    @{ Name = "blue";   R = 0;   G = 0;   B = 255 }
    @{ Name = "cyan";   R = 0;   G = 255; B = 255 }
    @{ Name = "gray";   R = 128; G = 128; B = 128 }
    @{ Name = "green";  R = 0;   G = 128; B = 0 }
    @{ Name = "orange"; R = 255; G = 165; B = 0 }
    @{ Name = "pink";   R = 255; G = 192; B = 203 }
    @{ Name = "purple"; R = 128; G = 0;   B = 128 }
    @{ Name = "red";    R = 255; G = 0;   B = 0 }
    @{ Name = "white";  R = 255; G = 255; B = 255 }
    @{ Name = "yellow"; R = 255; G = 255; B = 0 }
)

Write-Host "Starting Auto-Color Sorting for $($files.Count) images..." -ForegroundColor Green

foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $bmp = New-Object System.Drawing.Bitmap 50, 50
        $graphics = [System.Drawing.Graphics]::FromImage($bmp)
        $graphics.DrawImage($img, 0, 0, 50, 50)
        $graphics.Dispose()
        $img.Dispose()
        
        $colorVotes = @{}
        foreach ($c in $palette) { $colorVotes[$c.Name] = 0 }
        $validPixels = 0
        $bg = $bmp.GetPixel(0,0)
        
        for ($x = 10; $x -lt 40; $x++) {
            for ($y = 10; $y -lt 40; $y++) {
                $pixel = $bmp.GetPixel($x, $y)
                if ($pixel.A -lt 200) { continue }
                $bgDist = [math]::Abs($pixel.R - $bg.R) + [math]::Abs($pixel.G - $bg.G) + [math]::Abs($pixel.B - $bg.B)
                if ($bgDist -lt 35) { continue }
                
                $closestPixelColor = "white"
                $minDistance = 999999
                foreach ($c in $palette) {
                    $rDiff = $pixel.R - $c.R
                    $gDiff = $pixel.G - $c.G
                    $bDiff = $pixel.B - $c.B
                    $distance = ($rDiff * $rDiff) + ($gDiff * $gDiff) + ($bDiff * $bDiff)
                    if ($distance -lt $minDistance) {
                        $minDistance = $distance
                        $closestPixelColor = $c.Name
                    }
                }
                $colorVotes[$closestPixelColor]++
                $validPixels++
            }
        }
        
        $closestColor = "white"
        if ($validPixels -eq 0) {
            $pixel = $bmp.GetPixel(25, 25)
            $minDistance = 999999
            foreach ($c in $palette) {
                $rDiff = $pixel.R - $c.R
                $gDiff = $pixel.G - $c.G
                $bDiff = $pixel.B - $c.B
                $distance = ($rDiff * $rDiff) + ($gDiff * $gDiff) + ($bDiff * $bDiff)
                if ($distance -lt $minDistance) {
                    $minDistance = $distance
                    $closestColor = $c.Name
                }
            }
        } else {
            $weights = @{
                "red" = 4.0; "orange" = 4.0; "yellow" = 4.0; "green" = 4.0;
                "cyan" = 4.0; "blue" = 4.0; "purple" = 4.0; "pink" = 4.0;
                "black" = 1.0; "white" = 1.0; "gray" = 0.5; "beige" = 0.2
            }
            $maxScore = -1
            foreach ($key in $colorVotes.Keys) {
                $score = $colorVotes[$key] * $weights[$key]
                if ($score -gt $maxScore) {
                    $maxScore = $score
                    $closestColor = $key
                }
            }
        }
        $bmp.Dispose()
        
        $targetFolder = Join-Path $imagesDir $closestColor
        if (-not (Test-Path $targetFolder)) {
            New-Item -ItemType Directory -Path $targetFolder | Out-Null
        }
        
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $ext = $file.Extension
        $targetPath = Join-Path $targetFolder $file.Name
        $counter = 1
        while (Test-Path $targetPath) {
            $targetPath = Join-Path $targetFolder "$baseName ($counter)$ext"
            $counter++
        }

        Move-Item -Path $file.FullName -Destination $targetPath
        Write-Host "Moved [$($file.Name)] -> Sorted into '$closestColor' folder as '$(Split-Path $targetPath -Leaf)'!" -ForegroundColor Cyan
    } catch {
        Write-Host "Failed to process $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nAll files sorted successfully!" -ForegroundColor Green
if (-not $NoPause) { Read-Host "Press Enter to exit..." }
