Add-Type -AssemblyName System.Drawing
$graphicsDirectory = Join-Path (Get-Location) 'dist/assets/editorial'
New-Item -ItemType Directory -Force -Path $graphicsDirectory | Out-Null
$diagrams = @(
 @{slug='ram-shortage-ai-memory-demand';title='Different memory markets';items=@(@('Desktop RAM','DDR4 or DDR5 kits','Your PC applications'),@('Server DRAM','Supported server modules','Server system memory'),@('HBM','Stacked accelerator memory','High-bandwidth workloads'))},
 @{slug='ai-demand-gaming-gpu-prices';title='Two different GPU markets';items=@(@('Gaming graphics','Example: GeForce RTX 3060','GDDR6 on a desktop card'),@('AI accelerators','Example: NVIDIA H100','HBM and data-center interconnects'))},
 @{slug='what-gpus-do-in-ai-data-centers';title='Training and inference';items=@(@('Training','Examples and optimization','Adjust model parameters'),@('Trained model','Learned parameters','Ready for new inputs'),@('Inference','Run the trained model','Produce a response or prediction'))},
 @{slug='hbm-ddr-gddr-memory-explained';title='Where memory fits';items=@(@('Desktop DDR','System memory','Motherboard modules'),@('Server DRAM','Server system memory','Server modules'),@('GDDR','Graphics memory','GPU board chips'),@('HBM','Accelerator memory','Stacked near compute'))}
)
foreach($diagram in $diagrams){
 $bitmap=[System.Drawing.Bitmap]::new(1200,675);$g=[System.Drawing.Graphics]::FromImage($bitmap);$g.SmoothingMode='AntiAlias';$g.TextRenderingHint='AntiAliasGridFit';$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#101c30'))
 $white=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f4f7fe'));$muted=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#b8c9e0'));$blue=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#85b3ff'));$surface=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#1b2d47'));$pen=[System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#5276a2'),2)
 $heading=[System.Drawing.Font]::new('Arial',48,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel);$title=[System.Drawing.Font]::new('Arial',27,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel);$text=[System.Drawing.Font]::new('Arial',23,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel);$small=[System.Drawing.Font]::new('Arial',20,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
 $g.DrawString($diagram.title,$heading,$white,64,62);$g.DrawString('Hardware explained',$small,$blue,68,130)
 $cardWidth=(1072-24*($diagram.items.Count-1))/$diagram.items.Count
 for($i=0;$i -lt $diagram.items.Count;$i++){$x=64+$i*($cardWidth+24);$item=$diagram.items[$i];$g.FillRectangle($surface,$x,222,$cardWidth,290);$g.DrawRectangle($pen,$x,222,$cardWidth,290);$g.FillRectangle($blue,$x+22,246,36,6);$g.DrawString($item[0],$title,$white,[System.Drawing.RectangleF]::new($x+22,282,$cardWidth-44,70));$g.DrawString($item[1],$text,$blue,[System.Drawing.RectangleF]::new($x+22,354,$cardWidth-44,65));$g.DrawString($item[2],$text,$muted,[System.Drawing.RectangleF]::new($x+22,425,$cardWidth-44,70))}
 $g.DrawString('PC Part Performance',$small,$muted,66,594);$bitmap.Save((Join-Path $graphicsDirectory ($diagram.slug+'.png')),[System.Drawing.Imaging.ImageFormat]::Png)
 foreach($resource in @($white,$muted,$blue,$surface,$pen,$heading,$title,$text,$small,$g,$bitmap)){$resource.Dispose()}
}
