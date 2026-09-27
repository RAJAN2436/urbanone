Add-Type -AssemblyName System.Drawing

function Draw-KalsenLogo {
    param(
        [System.Drawing.Graphics]$g,
        [float]$x,
        [float]$y,
        [float]$size
    )
    $scale = $size / 200.0

    # Colors
    $orangeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(249, 115, 22))
    $darkOrangeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(234, 88, 12))
    $charcoalBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(24, 24, 27))
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $orangePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(234, 88, 12), [float](3.5 * $scale))
    $orangePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $orangePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    # Speed streaks
    $streaks = @(
        @{ x = 20; y = 56; w = 34; h = 10 },
        @{ x = 8;  y = 78; w = 46; h = 10 },
        @{ x = 18; y = 100; w = 36; h = 10 },
        @{ x = 28; y = 122; w = 26; h = 10 }
    )
    foreach ($s in $streaks) {
        $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $sx = $x + $s.x * $scale
        $sy = $y + $s.y * $scale
        $sw = $s.w * $scale
        $sh = $s.h * $scale
        $path.AddArc($sx, $sy, $sh, $sh, 90, 180)
        $path.AddArc($sx + $sw - $sh, $sy, $sh, $sh, 270, 180)
        $path.CloseFigure()
        $g.FillPath($orangeBrush, $path)
        $path.Dispose()
    }

    # Stem of 'K' (slanted polygon)
    $stem = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $stemPts = @(
        [System.Drawing.PointF]::new($x + 85 * $scale, $y + 24 * $scale),
        [System.Drawing.PointF]::new($x + 115 * $scale, $y + 24 * $scale),
        [System.Drawing.PointF]::new($x + 85 * $scale, $y + 175 * $scale),
        [System.Drawing.PointF]::new($x + 55 * $scale, $y + 175 * $scale)
    )
    $stem.AddPolygon($stemPts)
    $g.FillPath($darkOrangeBrush, $stem)
    $stem.Dispose()

    # Top diagonal wing of 'K'
    $wing = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $wingPts = @(
        [System.Drawing.PointF]::new($x + 115 * $scale, $y + 48 * $scale),
        [System.Drawing.PointF]::new($x + 180 * $scale, $y + 24 * $scale),
        [System.Drawing.PointF]::new($x + 140 * $scale, $y + 102 * $scale),
        [System.Drawing.PointF]::new($x + 105 * $scale, $y + 76 * $scale)
    )
    $wing.AddPolygon($wingPts)
    $g.FillPath($orangeBrush, $wing)
    $wing.Dispose()

    # Bottom charcoal diagonal leg of 'K'
    $leg = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $legPts = @(
        [System.Drawing.PointF]::new($x + 125 * $scale, $y + 106 * $scale),
        [System.Drawing.PointF]::new($x + 176 * $scale, $y + 175 * $scale),
        [System.Drawing.PointF]::new($x + 138 * $scale, $y + 175 * $scale),
        [System.Drawing.PointF]::new($x + 92 * $scale, $y + 120 * $scale)
    )
    $leg.AddPolygon($legPts)
    $g.FillPath($charcoalBrush, $leg)
    $leg.Dispose()

    # Food Cloche
    $g.FillEllipse($whiteBrush, $x + 101 * $scale, $y + 57 * $scale, 10 * $scale, 10 * $scale)
    $cloche = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $cloche.AddBezier($x + 78 * $scale, $y + 98 * $scale, $x + 78 * $scale, $y + 70 * $scale, $x + 134 * $scale, $y + 70 * $scale, $x + 134 * $scale, $y + 98 * $scale)
    $cloche.CloseFigure()
    $g.FillPath($whiteBrush, $cloche)
    $cloche.Dispose()

    # Cloche arc stroke
    $g.DrawArc($orangePen, $x + 100 * $scale, $y + 72 * $scale, 32 * $scale, 32 * $scale, 200, 110)

    # Cloche base plate
    $plate = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $px = $x + 70 * $scale
    $py = $y + 98 * $scale
    $pw = 72 * $scale
    $ph = 7 * $scale
    $plate.AddArc($px, $py, $ph, $ph, 90, 180)
    $plate.AddArc($px + $pw - $ph, $py, $ph, $ph, 270, 180)
    $plate.CloseFigure()
    $g.FillPath($whiteBrush, $plate)
    $plate.Dispose()

    # Clean up
    $orangeBrush.Dispose()
    $darkOrangeBrush.Dispose()
    $charcoalBrush.Dispose()
    $whiteBrush.Dispose()
    $orangePen.Dispose()
}

function Create-LauncherIcon {
    param([int]$size, [string]$path, [bool]$isRound)
    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Background Shape: Clean White or Vibrant Gradient
    $bgBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    if ($isRound) {
        $g.FillEllipse($bgBrush, 1, 1, $size - 2, $size - 2)
    } else {
        $corner = $size * 0.22
        $pathBg = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $pathBg.AddArc(1, 1, $corner * 2, $corner * 2, 180, 90)
        $pathBg.AddArc($size - 1 - $corner * 2, 1, $corner * 2, $corner * 2, 270, 90)
        $pathBg.AddArc($size - 1 - $corner * 2, $size - 1 - $corner * 2, $corner * 2, $corner * 2, 0, 90)
        $pathBg.AddArc(1, $size - 1 - $corner * 2, $corner * 2, $corner * 2, 90, 90)
        $pathBg.CloseFigure()
        $g.FillPath($bgBrush, $pathBg)
        $pathBg.Dispose()
    }
    $bgBrush.Dispose()

    # Draw centered Kalsen logo
    $logoSize = $size * 0.72
    $offset = ($size - $logoSize) / 2.0
    Draw-KalsenLogo -g $g -x $offset -y $offset -size $logoSize

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Create-ForegroundIcon {
    param([int]$size, [string]$path)
    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)

    $logoSize = $size * 0.65
    $offset = ($size - $logoSize) / 2.0
    Draw-KalsenLogo -g $g -x $offset -y $offset -size $logoSize

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Create-SplashScreen {
    param([int]$w, [int]$h, [string]$path)
    $bmp = [System.Drawing.Bitmap]::new($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(9, 9, 11))

    # Glow in center
    $centerSize = [Math]::Min($w, $h) * 0.6
    $glowPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $glowPath.AddEllipse(($w - $centerSize)/2, ($h - $centerSize)/2, $centerSize, $centerSize)
    $glowBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($glowPath)
    $glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(40, 234, 88, 12)
    $glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 9, 9, 11))
    $g.FillPath($glowBrush, $glowPath)
    $glowBrush.Dispose()
    $glowPath.Dispose()

    # Draw centered Logo
    $logoSize = [Math]::Min($w, $h) * 0.38
    $logoX = ($w - $logoSize) / 2.0
    $logoY = ($h - $logoSize) / 2.0 - ($logoSize * 0.15)
    Draw-KalsenLogo -g $g -x $logoX -y $logoY -size $logoSize

    # Text branding
    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $titleFont = [System.Drawing.Font]::new($fontFamily, [float]($logoSize * 0.14), [System.Drawing.FontStyle]::Bold)
    $subFont = [System.Drawing.Font]::new($fontFamily, [float]($logoSize * 0.07), [System.Drawing.FontStyle]::Regular)
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $orangeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(249, 115, 22))
    $grayBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(161, 161, 170))

    $sf = [System.Drawing.StringFormat]::new()
    $sf.Alignment = [System.Drawing.StringAlignment]::Center

    $textY = $logoY + $logoSize + ($logoSize * 0.08)
    $g.DrawString("KalsenOne", $titleFont, $whiteBrush, [float]($w / 2), [float]$textY, $sf)
    $g.DrawString("DELIVERY PARTNER", $subFont, $orangeBrush, [float]($w / 2), [float]($textY + $logoSize * 0.18), $sf)

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $titleFont.Dispose()
    $subFont.Dispose()
    $whiteBrush.Dispose()
    $orangeBrush.Dispose()
    $grayBrush.Dispose()
    $sf.Dispose()
    $g.Dispose()
    $bmp.Dispose()
}

$resPath = "d:\KalsenOne\kalsen-platform\delivery-partner-app\android\app\src\main\res"

$mipmaps = @(
    @{ name = "mipmap-mdpi"; size = 48; fg = 108 },
    @{ name = "mipmap-hdpi"; size = 72; fg = 162 },
    @{ name = "mipmap-xhdpi"; size = 96; fg = 216 },
    @{ name = "mipmap-xxhdpi"; size = 144; fg = 324 },
    @{ name = "mipmap-xxxhdpi"; size = 192; fg = 432 }
)

foreach ($m in $mipmaps) {
    $dir = Join-Path $resPath $m.name
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }
    Create-LauncherIcon -size $m.size -path (Join-Path $dir "ic_launcher.png") -isRound $false
    Create-LauncherIcon -size $m.size -path (Join-Path $dir "ic_launcher_round.png") -isRound $true
    Create-ForegroundIcon -size $m.fg -path (Join-Path $dir "ic_launcher_foreground.png")
    Write-Host "Generated icons for $($m.name)"
}

# Splash screens
$splashes = @(
    @{ dir = "drawable"; w = 480; h = 800 },
    @{ dir = "drawable-port-mdpi"; w = 320; h = 480 },
    @{ dir = "drawable-port-hdpi"; w = 480; h = 800 },
    @{ dir = "drawable-port-xhdpi"; w = 720; h = 1280 },
    @{ dir = "drawable-port-xxhdpi"; w = 960; h = 1600 },
    @{ dir = "drawable-port-xxxhdpi"; w = 1280; h = 1920 }
)

foreach ($s in $splashes) {
    $dir = Join-Path $resPath $s.dir
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }
    Create-SplashScreen -w $s.w -h $s.h -path (Join-Path $dir "splash.png")
    Write-Host "Generated splash for $($s.dir)"
}

Write-Host "All KalsenOne icons and splash screens successfully generated!"
