param(
  [switch]$DryRun
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$partialsDir = Join-Path $repoRoot "partials"

$topBarPath = Join-Path $partialsDir "top-bar.html"
$headerFullPath = Join-Path $partialsDir "header-full.html"
$headerMinimalPath = Join-Path $partialsDir "header-minimal.html"
$footerPath = Join-Path $partialsDir "footer.html"

foreach ($path in @($topBarPath, $headerFullPath, $headerMinimalPath, $footerPath)) {
  if (-not (Test-Path $path)) {
    Write-Error "Missing partial: $path"
    exit 1
  }
}

$topBar = Get-Content -Raw -Path $topBarPath
$headerFull = Get-Content -Raw -Path $headerFullPath
$headerMinimal = Get-Content -Raw -Path $headerMinimalPath
$footer = Get-Content -Raw -Path $footerPath

$htmlFiles = Get-ChildItem -Path $repoRoot -Filter "*.html" -File
$updated = 0
$skipped = 0

foreach ($file in $htmlFiles) {
  $content = Get-Content -Raw -Path $file.FullName
  $headerMatch = [regex]::Match($content, '<header class="site-header">[\s\S]*?</header>')

  if (-not $headerMatch.Success) {
    $skipped++
    continue
  }

  $usesDropdowns = $headerMatch.Value -match 'class="has-dropdown"'
  $headerTemplate = if ($usesDropdowns) { $headerFull } else { $headerMinimal }
  $combined = "$topBar`r`n`r`n$headerTemplate"
  $hasTopBarBlock = $content -match '<!-- Top Bar -->[\s\S]*?<header class="site-header">[\s\S]*?</header>'

  if ($hasTopBarBlock) {
    $updatedContent = [regex]::Replace(
      $content,
      '\s*<!-- Top Bar -->[\s\S]*?<header class="site-header">[\s\S]*?</header>\s*',
      "`r`n$combined`r`n`r`n",
      1
    )
  } else {
    $updatedContent = [regex]::Replace(
      $content,
      '<header class="site-header">[\s\S]*?</header>\s*',
      "$combined`r`n`r`n",
      1
    )
  }

  if ($updatedContent -match '<footer class="site-footer">[\s\S]*?</footer>') {
    $updatedContent = [regex]::Replace(
      $updatedContent,
      '<footer class="site-footer">[\s\S]*?</footer>',
      $footer,
      1
    )
  }

  if ($updatedContent -ne $content) {
    $updated++
    if (-not $DryRun) {
      Set-Content -Path $file.FullName -Value $updatedContent
    }
  }
}

if ($DryRun) {
  Write-Host "[DryRun] HTML files that would be updated: $updated"
} else {
  Write-Host "HTML files updated: $updated"
}
Write-Host "HTML files skipped (no site-header found): $skipped"
