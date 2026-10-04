Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$publicationImageDirectory = Join-Path (Get-Location) 'dist/assets/publication'
New-Item -ItemType Directory -Force -Path $publicationImageDirectory | Out-Null
$publicationDiagrams = @(
 @{id='graphics-driver-update-rollback-checklist';title='Keep a reproducible driver-change record';items=@(@('Before','GPU + OS + driver version','Record the symptom and setup'),@('Change','Follow official instructions','Check rollback prerequisites'),@('After','Repeat the same workload','Document what actually changed'))},
 @{id='b650-tomahawk-m2-pcie-lane-sharing';title='Know your motherboard connections';items=@(@('M2_3 alone','PCIe 4.0 x4','Published slot connection'),@('M2_3 + PCI_E2','Both at x2','Documented sharing rule'),@('Ryzen 8500 / 8300','M2_2 unavailable','CPU-specific restriction'))},
 @{id='rtx-5060-ti-8gb-vs-16gb';title='RTX 5060 Ti: compare memory capacity';items=@(@('8 GB GDDR7','4,608 CUDA cores','Reference configuration'),@('16 GB GDDR7','4,608 CUDA cores','Reference configuration'),@('Before buying','Check exact variant','Use workload-specific tests'))},
 @{id='usb-c-speed-charging-display-checklist';title='One connector. Separate capabilities.';items=@(@('Data','Protocol and speed','Check both devices'),@('Power','Device + charger + cable','Check requirements together'),@('Video','Output and adapter','Check the complete path'))},
 @{id='local-ai-memory-weights-kv-cache';title='Budget beyond the model weights';items=@(@('Weights','Parameters x bits','A simplified storage estimate'),@('Runtime','Working allocations','Enter a measured allowance'),@('KV cache','Context and concurrency','Use the intended configuration'))},
 @{id='pc-upgrade-total-platform-cost';title='Compare the whole upgrade';items=@(@('Processor','Exact model','Start with your requirements'),@('Platform','Board + RAM + cooling','Check reusable parts'),@('Complete budget','Shipping + other costs','Use consistent currency'))},
 @{id='phone-software-support-commitment-vs-end-date';title='A support policy needs an anchor';items=@(@('Scope','OS and security','Read what is promised'),@('Starting event','Verified availability','Do not guess a date'),@('End date','Source-backed only','Unknown stays unknown'))},
 @{id='memory-market-watch-ai-is-not-a-retail-price';title='Different evidence answers different questions';items=@(@('Company report','Business and outlook','Company-reported evidence'),@('Retail observation','Exact SKU + time + stock','A buying-data record'),@('Market trend','Consistent repeated sample','Document the methodology'))},
 @{id='pc-electricity-cost';title='Plan your electricity budget';items=@(@('Wall power','Watts x hours / 1,000','Daily energy in kWh'),@('Your rate','Price per kWh','Read your own tariff'),@('Cost','Energy x rate','Same usage assumption'))},
 @{id='platform-upgrade-cost';title='Two paths. Complete budgets.';items=@(@('Option A','CPU + board + RAM','Add cooling and other costs'),@('Option B','CPU + board + RAM','Use the same currency'),@('Difference','B minus A','Cost, not a performance score'))},
 @{id='monitor-pixel-density';title='Display geometry you can calculate';items=@(@('Resolution','Horizontal x vertical','Use the native panel pixels'),@('Diagonal','Measured in inches','Active screen rectangle'),@('Density','Pixels per inch','Not a display-quality score'))},
 @{id='recording-storage';title='Recording time becomes storage';items=@(@('Bitrate','Video + audio','Combined megabits per second'),@('Duration','Hours into seconds','Use your intended session'),@('Capacity','Bytes into GB / GiB','Add your manual allowance'))},
 @{id='local-ai-memory';title='A transparent AI memory plan';items=@(@('Weight storage','Parameters x average bits','Convert bytes to GiB'),@('Runtime + KV','Manual budget inputs','Unknown is not zero'),@('Verify','Test actual peak memory','Fit and speed not certified'))},
 @{id='frame-time-budget';title='Translate FPS into milliseconds';items=@(@('60 FPS','16.67 ms','Average-rate interval'),@('120 FPS','8.33 ms','Average-rate interval'),@('144 Hz','6.94 ms','Display refresh interval'))},
 @{id='b650-tomahawk-lane-check';title='Check the documented sharing rule';items=@(@('M2_3','x4 when used alone','PCIe 4.0 link'),@('PCI_E2','Up to x2','Long slot is not x4'),@('Both occupied','M2_3 becomes x2','Check the CPU group too'))},
 @{id='catalog-coverage';title='Audit the dataset before using it';items=@(@('Denominator','Unique catalog IDs','Not global market share'),@('Coverage','Fields and image identity','A count is not certification'),@('Reuse','Versioned CSV + JSON','Method and limits included'))},
 @{id='phone-size';title='Compare body dimensions at one scale';items=@(@('Height + width','Published dimensions','Same-scale outlines'),@('Thickness + weight','Numerical differences','Not a grip or camera test'),@('Screen on device','Browser zoom varies','Not physical-size calibration'))}
)
foreach ($diagram in $publicationDiagrams) {
 $bitmap=[System.Drawing.Bitmap]::new(1200,675)
 $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
 $graphics.SmoothingMode='AntiAlias';$graphics.TextRenderingHint='AntiAliasGridFit'
 $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#111e32'))
 $white=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f4f7fc'))
 $muted=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#c2d0e2'))
 $blue=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#89b6ff'))
 $surface=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#20324e'))
 $pen=[System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#5077a8'),2)
 $heading=[System.Drawing.Font]::new('Arial',40,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
 $title=[System.Drawing.Font]::new('Arial',27,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
 $text=[System.Drawing.Font]::new('Arial',23,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
 $small=[System.Drawing.Font]::new('Arial',20,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
 $graphics.DrawString($diagram.title,$heading,$white,[System.Drawing.RectangleF]::new(64,54,1070,115))
 for($i=0;$i -lt 3;$i++) {
  $x=64+$i*365;$item=$diagram.items[$i]
  $graphics.FillRectangle($surface,$x,215,342,320);$graphics.DrawRectangle($pen,$x,215,342,320)
  $graphics.FillRectangle($blue,$x+24,242,40,5)
  $graphics.DrawString($item[0],$title,$white,[System.Drawing.RectangleF]::new($x+24,275,294,85))
  $graphics.DrawString($item[1],$text,$blue,[System.Drawing.RectangleF]::new($x+24,362,294,75))
  $graphics.DrawString($item[2],$text,$muted,[System.Drawing.RectangleF]::new($x+24,443,294,80))
 }
 $graphics.DrawString('PC Part Performance',$small,$muted,66,602)
 $publicationImageStream = [System.IO.MemoryStream]::new()
 $bitmap.Save($publicationImageStream,[System.Drawing.Imaging.ImageFormat]::Png)
 $publicationImageTarget = [System.IO.Path]::GetFullPath((Join-Path $publicationImageDirectory ($diagram.id+'.png')))
 $publicationImageTemporary = Join-Path $publicationImageDirectory ($diagram.id + '-' + [guid]::NewGuid().ToString() + '.tmp')
 if (-not $publicationImageTarget.StartsWith([System.IO.Path]::GetFullPath($publicationImageDirectory) + [System.IO.Path]::DirectorySeparatorChar)) { throw 'Image path escaped the asset directory.' }
 [System.IO.File]::WriteAllBytes($publicationImageTemporary,$publicationImageStream.ToArray())
 if (Test-Path -LiteralPath $publicationImageTarget) {
  if ((Get-FileHash -LiteralPath $publicationImageTarget).Hash -eq (Get-FileHash -LiteralPath $publicationImageTemporary).Hash) {
   Remove-Item -LiteralPath $publicationImageTemporary
  } else {
   # Both paths have been checked inside this generated asset directory.
   Remove-Item -LiteralPath $publicationImageTarget
   Move-Item -LiteralPath $publicationImageTemporary -Destination $publicationImageTarget
  }
 } else {
  Move-Item -LiteralPath $publicationImageTemporary -Destination $publicationImageTarget
 }
 $publicationImageStream.Dispose()
 foreach($resource in @($white,$muted,$blue,$surface,$pen,$heading,$title,$text,$small,$graphics,$bitmap)){$resource.Dispose()}
}
