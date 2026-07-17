param([int]$MaxPages = 500)
$ErrorActionPreference = 'Stop'
$root = [Uri]'http://www.thuccoffee.com.vn/'
$queue = [Collections.Generic.Queue[string]]::new()
$seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$queued = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$pages = [Collections.Generic.List[object]]::new()
$assetPattern = '\.(css|js|json|xml|jpe?g|png|gif|webp|svg|ico|woff2?|ttf|eot|pdf|zip|mp4|webm|mp3)(\?|$)'

function Get-NormalizedUrl([string]$Href, [string]$BaseUrl) {
  if ([string]::IsNullOrWhiteSpace($Href) -or $Href -match '^(#|mailto:|tel:|javascript:|data:)') { return $null }
  try { $uri = [Uri]::new([Uri]$BaseUrl, $Href) } catch { return $null }
  if ($uri.Host -notin @('www.thuccoffee.com.vn', 'thuccoffee.com.vn') -or $uri.AbsolutePath -match $assetPattern) { return $null }
  $path = $uri.AbsolutePath
  if (-not $path.EndsWith('/') -and [IO.Path]::GetExtension($path) -eq '') { $path += '/' }
  return "http://www.thuccoffee.com.vn$path"
}

$queue.Enqueue($root.AbsoluteUri)
$queued.Add($root.AbsoluteUri) | Out-Null
while ($queue.Count -and $seen.Count -lt $MaxPages) {
  $url = $queue.Dequeue()
  if (-not $seen.Add($url)) { continue }
  $status = $null; $title = ''; $headings = @(); $links = @(); $text = ''; $errorText = $null
  try {
    $response = Invoke-WebRequest -Uri $url -MaximumRedirection 8 -TimeoutSec 35 -Headers @{'User-Agent'='Mozilla/5.0 THUCCoffeeCloneScout/1.0'}
    $status = [int]$response.StatusCode
    $html = $response.Content
    $match = [regex]::Match($html, '<title[^>]*>(.*?)</title>', 'IgnoreCase,Singleline')
    if ($match.Success) { $title = [Net.WebUtility]::HtmlDecode(($match.Groups[1].Value -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()) }
    $headings = @([regex]::Matches($html, '<h([1-6])\b[^>]*>(.*?)</h\1>', 'IgnoreCase,Singleline') | ForEach-Object {
      [pscustomobject]@{level=[int]$_.Groups[1].Value; text=[Net.WebUtility]::HtmlDecode(($_.Groups[2].Value -replace '<[^>]+>', ' ' -replace '\s+', ' ').Trim())}
    } | Where-Object text)
    $links = @($response.Links | ForEach-Object { Get-NormalizedUrl ([string]$_.href) $url } | Where-Object {$_} | Sort-Object -Unique)
    foreach ($link in $links) { if (-not $seen.Contains($link) -and $queued.Add($link)) { $queue.Enqueue($link) } }
    $clean = $html -replace '(?is)<script\b[^>]*>.*?</script>', ' ' -replace '(?is)<style\b[^>]*>.*?</style>', ' '
    $text = [Net.WebUtility]::HtmlDecode(($clean -replace '(?is)<[^>]+>', ' ' -replace '\s+', ' ').Trim())
    if ($text.Length -gt 12000) { $text = $text.Substring(0,12000) }
  } catch {
    $errorText = $_.Exception.Message
    if ($_.Exception.Response) { try { $status = [int]$_.Exception.Response.StatusCode } catch {} }
  }
  $pages.Add([pscustomobject]@{url=$url; status=$status; title=$title; headings=$headings; internalLinks=$links; text=$text; error=$errorText})
  Write-Host "[$($seen.Count)/$MaxPages] $status $url"
  Start-Sleep -Milliseconds 120
}

$output = Join-Path $PSScriptRoot 'thuccoffee-site-crawl.json'
[pscustomobject]@{generatedAt=(Get-Date).ToString('o'); pageCount=$pages.Count; queuedRemaining=$queue.Count; pages=$pages} |
  ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $output -Encoding utf8
Write-Host "OUTPUT=$output"
Write-Host "PAGES=$($pages.Count) QUEUED_REMAINING=$($queue.Count)"
