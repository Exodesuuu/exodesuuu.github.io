# James Mesa Portfolio - Automatic Color Sorter!
# Place all your new, unsorted images into the 'images\unsorted' folder and run this script.
# It will mathematically scan the center of each image, find the dominant color, and move the file into the correct color folder!

Add-Type -AssemblyName System.Drawing

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$unsortedDir = Join-Path $scriptPath "images\unsorted"
$imagesDir = Join-Path $scriptPath "images"

if (-not (Test-Path $unsortedDir)) {
    New-Item -ItemType Directory -Path $unsortedDir | Out-Null
    Write-Host "I just created a folder called 'images\unsorted'." -ForegroundColor Cyan
    Write-Host "Please place all your new design files in there, then run this script again!" -ForegroundColor Cyan
    Read-Host "Press Enter to exit..."
    exit
}

$files = Get-ChildItem -Path $unsortedDir -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }
if ($files.Count -eq 0) {
    Write-Host "No images found in 'images\unsorted'. Put some images there first!" -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    exit
}

# Define our destination color palette map
$palette = @(
    @{ Name = "black";  R = 30;  G = 30;  B = 30 }
    @{ Name = "white";  R = 240; G = 240; B = 240 }
    @{ Name = "red";    R = 230; G = 30;  B = 30 }
    @{ Name = "blue";   R = 30;  G = 30;  B = 230 }
    @{ Name = "green";  R = 30;  G = 180; B = 30 }
    @{ Name = "yellow"; R = 230; G = 230; B = 30 }
    @{ Name = "orange"; R = 240; G = 130; B = 20 }
    @{ Name = "purple"; R = 150; G = 30;  B = 180 }
    @{ Name = "pink";   R = 255; G = 150; B = 180 }
    @{ Name = "cyan";   R = 30;  G = 220; B = 230 }
    @{ Name = "beige";  R = 220; G = 210; B = 180 }
)

Write-Host "Starting Auto-Color Sorting for $($files.Count) images..." -ForegroundColor Green
Write-Host "Scanning pixels..." -ForegroundColor DarkGray

foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Create a small 5x5 bitmap to sample colors (squashes the image, making it incredibly fast)
        $bmp = New-Object System.Drawing.Bitmap 5, 5
        $graphics = [System.Drawing.Graphics]::FromImage($bmp)
        $graphics.DrawImage($img, 0, 0, 5, 5)
        $graphics.Dispose()
        $img.Dispose()
        
        $totalR = 0; $totalG = 0; $totalB = 0; $validPixels = 0
        
        # Sample the center 3x3 pixels (ignores the background edges)
        for ($x = 1; $x -le 3; $x++) {
            for ($y = 1; $y -le 3; $y++) {
                $pixel = $bmp.GetPixel($x, $y)
                # Ignore pure white/transparent backgrounds so we only scan the jersey!
                if ($pixel.A -lt 255) { continue }
                if ($pixel.R -gt 240 -and $pixel.G -gt 240 -and $pixel.B -gt 240) { continue }
                
                $totalR += $pixel.R
                $totalG += $pixel.G
                $totalB += $pixel.B
                $validPixels++
            }
        }
        $bmp.Dispose()
        
        $avgR = 240; $avgG = 240; $avgB = 240 # Default to white if all pixels were background
        if ($validPixels -gt 0) {
            $avgR = [math]::Round($totalR / $validPixels)
            $avgG = [math]::Round($totalG / $validPixels)
            $avgB = [math]::Round($totalB / $validPixels)
        }
        
        # Find closest palette color mathematically using Euclidean distance
        $closestColor = "white"
        $minDistance = 999999
        
        foreach ($c in $palette) {
            $rDiff = $avgR - $c.R
            $gDiff = $avgG - $c.G
            $bDiff = $avgB - $c.B
            $distance = ($rDiff * $rDiff) + ($gDiff * $gDiff) + ($bDiff * $bDiff)
            
            if ($distance -lt $minDistance) {
                $minDistance = $distance
                $closestColor = $c.Name
            }
        }
        
        # Move the file to the correct color folder!
        $targetFolder = Join-Path $imagesDir $closestColor
        if (-not (Test-Path $targetFolder)) {
            New-Item -ItemType Directory -Path $targetFolder | Out-Null
        }
        
        $targetPath = Join-Path $targetFolder $file.Name
        Move-Item -Path $file.FullName -Destination $targetPath -Force
        
        Write-Host "Moved [$($file.Name)] -> Sorted into '$closestColor' folder!" -ForegroundColor Cyan
        
    } catch {
        Write-Host "Failed to process $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nAll files sorted successfully! Now double-click refresh_catalog.ps1 to update your website!" -ForegroundColor Green
Read-Host "Press Enter to exit..."
