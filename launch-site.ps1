$siteRoot = 'D:\CodexProjects\DensetsuWebsite'
$siteUrl = 'http://127.0.0.1:4173/'
$existing = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if (-not $existing) {
  Start-Process -WindowStyle Hidden -FilePath 'node' -ArgumentList 'scripts/serve.mjs' -WorkingDirectory $siteRoot
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 100
    try { Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 1 | Out-Null; break } catch { }
  }
}
Start-Process $siteUrl
