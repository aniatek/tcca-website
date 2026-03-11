param(
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"

function Resolve-AssetPath {
  param(
    [string]$BaseDir,
    [string]$RawPath,
    [string]$RootDir
  )

  if ([string]::IsNullOrWhiteSpace($RawPath)) {
    return $null
  }

  if ($RawPath -match '^(https?:)?//') {
    return $null
  }

  if ($RawPath.StartsWith('#') -or $RawPath.StartsWith('mailto:') -or $RawPath.StartsWith('tel:') -or $RawPath.StartsWith('data:')) {
    return $null
  }

  if ($RawPath.StartsWith('/')) {
    return Join-Path $RootDir $RawPath.TrimStart('/')
  }

  return Join-Path $BaseDir $RawPath
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$htmlFiles = Get-ChildItem -Path $root -Filter *.html -File
$cssFiles = Get-ChildItem -Path (Join-Path $root "css") -Filter *.css -File -ErrorAction SilentlyContinue

$missing = New-Object System.Collections.Generic.List[string]

foreach ($file in $htmlFiles) {
  $content = Get-Content -Raw $file.FullName
  $matches = [regex]::Matches($content, '(?i)(?:src|href)=\"([^\"]+)\"')
  foreach ($m in $matches) {
    $rawPath = $m.Groups[1].Value
    $resolved = Resolve-AssetPath -BaseDir $file.DirectoryName -RawPath $rawPath -RootDir $root
    if ($null -eq $resolved) { continue }
    if (-not (Test-Path $resolved)) {
      $missing.Add("$($file.Name): $rawPath")
    }
  }
}

foreach ($file in $cssFiles) {
  $content = Get-Content -Raw $file.FullName
  $matches = [regex]::Matches($content, '(?i)url\((["' + "'" + '"]?)([^"' + "'" + ')]+)\1\)')
  foreach ($m in $matches) {
    $rawPath = $m.Groups[2].Value.Trim()
    $resolved = Resolve-AssetPath -BaseDir $file.DirectoryName -RawPath $rawPath -RootDir $root
    if ($null -eq $resolved) { continue }
    if (-not (Test-Path $resolved)) {
      $missing.Add("$($file.Name): $rawPath")
    }
  }
}

if ($missing.Count -gt 0) {
  if (-not $Quiet) {
    Write-Host "Missing asset references:"
    $missing | Sort-Object | ForEach-Object { Write-Host " - $_" }
  }
  exit 1
}

if (-not $Quiet) {
  Write-Host "All asset references resolved."
}
