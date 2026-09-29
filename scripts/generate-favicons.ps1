Add-Type -AssemblyName System.Drawing

function Draw-Favicon([int]$size) {
    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Clear transparent
    $g.Clear([System.Drawing.Color]::Transparent)

    # Scale factors
    $scale = [float]($size / 512.0)

    # Colors
    $bgColor = [System.Drawing.Color]::FromArgb(255, 18, 28, 25) # #121C19 deep emerald/ink
    $goldColor = [System.Drawing.Color]::FromArgb(255, 212, 175, 122) # #D4AF7A gold
    $goldLight = [System.Drawing.Color]::FromArgb(255, 243, 220, 186) # #F3DCBA champagne
    $goldDark = [System.Drawing.Color]::FromArgb(255, 180, 142, 90) # #B48E5A bronze

    # 1. Background rounded rectangle
    $cornerRad = [float](108.0 * $scale)
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $rect = [System.Drawing.RectangleF]::new([float](12.0 * $scale), [float](12.0 * $scale), [float]($size - 24.0 * $scale), [float]($size - 24.0 * $scale))
    
    $d = [float]($cornerRad * 2.0)
    $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
    $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
    $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()

    $bgBrush = [System.Drawing.SolidBrush]::new($bgColor)
    $g.FillPath($bgBrush, $path)

    # Gold frame
    $borderPen = [System.Drawing.Pen]::new($goldDark, [float](12.0 * $scale))
    $g.DrawPath($borderPen, $path)

    # 2. Architectural Roof (Real Estate Gable)
    $roofPen = [System.Drawing.Pen]::new($goldColor, [float](26.0 * $scale))
    $roofPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $roofPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $roofPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $pLeft = [System.Drawing.PointF]::new([float](125.0 * $scale), [float](195.0 * $scale))
    $pPeak = [System.Drawing.PointF]::new([float](256.0 * $scale), [float](95.0 * $scale))
    $pRight = [System.Drawing.PointF]::new([float](387.0 * $scale), [float](195.0 * $scale))

    $roofPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $roofPath.AddLine($pLeft, $pPeak)
    $roofPath.AddLine($pPeak, $pRight)
    $g.DrawPath($roofPen, $roofPath)

    # Chimney accent
    $chimneyPen = [System.Drawing.Pen]::new($goldColor, [float](14.0 * $scale))
    $chimneyPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $chimneyPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($chimneyPen, [float](335.0 * $scale), [float](108.0 * $scale), [float](335.0 * $scale), [float](148.0 * $scale))

    # Small apex sphere
    $sphereBrush = [System.Drawing.SolidBrush]::new($goldLight)
    $sphereRad = [float](10.0 * $scale)
    $g.FillEllipse($sphereBrush, [float](256.0 * $scale - $sphereRad), [float](76.0 * $scale - $sphereRad), [float]($sphereRad * 2), [float]($sphereRad * 2))

    # 3. Monogram "JM"
    $fontFamily = "Georgia"
    $fontSize = [float](205.0 * $scale)
    $font = [System.Drawing.Font]::new($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

    $stringFormat = [System.Drawing.StringFormat]::new()
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Text bounding box centered in bottom section
    $textRect = [System.Drawing.RectangleF]::new(0, [float](205.0 * $scale), [float]$size, [float](240.0 * $scale))

    # Draw subtle text shadow/glow
    $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(120, 0, 0, 0))
    $shadowRect = [System.Drawing.RectangleF]::new([float](2.0 * $scale), [float](207.0 * $scale), [float]$size, [float](240.0 * $scale))
    $g.DrawString("JM", $font, $shadowBrush, $shadowRect, $stringFormat)

    # Draw main gold text
    $textBrush = [System.Drawing.SolidBrush]::new($goldLight)
    $g.DrawString("JM", $font, $textBrush, $textRect, $stringFormat)

    # Cleanup
    $g.Dispose()
    return $bmp
}

# Generate PNGs
$sizes = @(16, 32, 48, 64, 180, 512)

foreach ($s in $sizes) {
    $bmp = Draw-Favicon $s
    if ($s -eq 180) {
        $bmp.Save("public/apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save("app/apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    } elseif ($s -eq 32) {
        $bmp.Save("public/favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save("app/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    } elseif ($s -eq 16) {
        $bmp.Save("public/favicon-16x16.png", [System.Drawing.Imaging.ImageFormat]::Png)
    } elseif ($s -eq 48) {
        $bmp.Save("public/favicon-48x48.png", [System.Drawing.Imaging.ImageFormat]::Png)
    } elseif ($s -eq 512) {
        $bmp.Save("public/icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $bmp.Dispose()
    Write-Host "Generated PNG ${s}x${s}"
}

# Generate multi-size ICO from 32x32 bitmap
$icoBmp = Draw-Favicon 32
$hIcon = $icoBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$fsApp = [System.IO.File]::Create("app/favicon.ico")
$icon.Save($fsApp)
$fsApp.Close()

$fsPub = [System.IO.File]::Create("public/favicon.ico")
$icon.Save($fsPub)
$fsPub.Close()

$icon.Dispose()
$icoBmp.Dispose()
Write-Host "Generated favicon.ico successfully in app/ and public/!"
