# James Mesa Portfolio - Automatic Color Sorter!
# Place all your new, unsorted images into the 'images\unsorted' folder and run this script.
# It will mathematically scan the center of each image, find the dominant color, and move the file into the correct color folder!

Add-Type -AssemblyName System.Drawing

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptPath
$unsortedDir = Join-Path $repoRoot "images\unsorted"
$imagesDir = Join-Path $repoRoot "images"

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
Write-Host "Scanning pixels..." -ForegroundColor DarkGray

foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Create a 50x50 bitmap to accurately sample the entire design
        $bmp = New-Object System.Drawing.Bitmap 50, 50
        $graphics = [System.Drawing.Graphics]::FromImage($bmp)
        $graphics.DrawImage($img, 0, 0, 50, 50)
        $graphics.Dispose()
        $img.Dispose()
        
        # Initialize vote counters for each palette color
        $colorVotes = @{}
        foreach ($c in $palette) { $colorVotes[$c.Name] = 0 }
        
        $validPixels = 0
        
        # Identify the studio mockup background color from the top-left corner
        $bg = $bmp.GetPixel(0,0)
        
        # Sample the center 60% of the image (X: 10 to 40, Y: 10 to 40)
        for ($x = 10; $x -lt 40; $x++) {
            for ($y = 10; $y -lt 40; $y++) {
                $pixel = $bmp.GetPixel($x, $y)
                
                # Ignore transparent
                if ($pixel.A -lt 200) { continue }
                
                # Dynamic Background Removal: Ignore pixels that match the studio background
                $bgDist = [math]::Abs($pixel.R - $bg.R) + [math]::Abs($pixel.G - $bg.G) + [math]::Abs($pixel.B - $bg.B)
                if ($bgDist -lt 35) { continue }
                
                # Mathematical Euclidean Distance (KDTree logic) against the standard RGB palette
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
                
                # Cast a vote for this color
                $colorVotes[$closestPixelColor]++
                $validPixels++
            }
        }
        
        $closestColor = "white"
        
        if ($validPixels -eq 0) {
            # Fallback: The entire jersey matched the studio background! 
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
            # The true dominant color is the one with the highest weighted score
            # Weights perfectly match the Google Site references (prioritizing accents over neutral bases)
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
