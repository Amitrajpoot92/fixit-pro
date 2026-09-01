Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\USER\FixitPro\assets\platform-img\new-logo.png")
$bmp = New-Object System.Drawing.Bitmap 1080, 1080
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Transparent)

# Safe zone for adaptive icon is ~66%. We'll scale the image to 650x650 inside a 1080x1080 canvas.
$size = 650
$x = [int]((1080 - $size) / 2)
$y = [int]((1080 - $size) / 2)
$g.DrawImage($img, $x, $y, $size, $size)
$g.Dispose()
$bmp.Save("C:\Users\USER\FixitPro\assets\platform-img\adaptive-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
$bmp.Dispose()
Write-Host "Adaptive icon padded and saved successfully!"
