param(
  [string]$csvPath = "g:\我的雲端硬碟\ai\list.csv",
  [string]$outPath = "g:\我的雲端硬碟\ai\books_list.json"
)

# Build header names with Unicode (avoid codepage issues)
$HN_Title  = ([string]([char]0x66F8)+[char]0x540D)                 # 書名
$HN_ISBN   = 'ISBN'
$HN_Target = ([string]([char]0x9069)+[char]0x5408)+([string]([char]0x5C0D)+[char]0x50CF)  # 適合對像

if (-not (Test-Path -LiteralPath $csvPath)) { throw "Missing CSV file: $csvPath" }

# Read all lines (UTF8) and locate the header row containing 書名/ISBN
$lines = Get-Content -LiteralPath $csvPath -Encoding UTF8
if (-not $lines -or $lines.Count -eq 0) { throw "CSV is empty" }

$headerIndex = -1
for ($i=0; $i -lt $lines.Count; $i++) {
  $ln = $lines[$i]
  if ($ln -match [Regex]::Escape($HN_Title) -and $ln -match [Regex]::Escape($HN_ISBN)) { $headerIndex = $i; break }
}
if ($headerIndex -lt 0) { throw "Header row not found (need Title & ISBN)" }

# Parse CSV from header row
$csv = $lines[$headerIndex..($lines.Count-1)] | ConvertFrom-Csv

# Validate columns exist
$first = $csv | Select-Object -First 1
if ($null -eq $first) { throw "No data rows after header" }
if (-not ($first.PSObject.Properties.Name -contains $HN_Title)) { throw "Missing column: Title" }
if (-not ($first.PSObject.Properties.Name -contains $HN_ISBN)) { throw "Missing column: ISBN" }
# 適合對象可選

# Transform rows -> JSON objects
$items = New-Object System.Collections.Generic.List[Object]
foreach ($row in $csv) {
  $title = ([string]$row.$HN_Title).Trim()
  $isbnRaw = ([string]$row.$HN_ISBN).Trim()
  $target = if ($row.PSObject.Properties.Name -contains $HN_Target) { ([string]$row.$HN_Target).Trim() } else { '' }
  if ([string]::IsNullOrWhiteSpace($title) -and [string]::IsNullOrWhiteSpace($isbnRaw)) { continue }
  # 處理被 Excel 轉成科學記號的 ISBN（例如 9.78627E+12）
  $isbnText = ($isbnRaw -replace "\s", "")
  $isbnNormalized = $null
  if ($isbnText -match '^(?<lead>\d)\.(?<frac>\d+)E\+(?<exp>\d+)$') {
    $lead = $Matches['lead']
    $frac = $Matches['frac']
    $exp  = [int]$Matches['exp']
    $zeros = $exp - $frac.Length
    if ($zeros -ge 0) {
      $isbnNormalized = $lead + $frac + ('0' * $zeros)
    } else {
      # 不太會發生在 ISBN，上保險：用 Double 解析後取整
      try {
        $d = [double]::Parse($isbnText, [System.Globalization.CultureInfo]::InvariantCulture)
        $isbnNormalized = [System.Math]::Round($d, 0, [System.MidpointRounding]::AwayFromZero).ToString('F0', [System.Globalization.CultureInfo]::InvariantCulture)
      } catch { $isbnNormalized = $isbnRaw }
    }
  } elseif ($isbnText -match 'E\+\d+') {
    # 其他帶 E+ 的情況，退回 Double 解析
    try {
      $d = [double]::Parse($isbnText, [System.Globalization.CultureInfo]::InvariantCulture)
      $isbnNormalized = [System.Math]::Round($d, 0, [System.MidpointRounding]::AwayFromZero).ToString('F0', [System.Globalization.CultureInfo]::InvariantCulture)
    } catch { $isbnNormalized = $isbnRaw }
  } else {
    $isbnNormalized = $isbnRaw
  }

  $isbn = ($isbnNormalized -replace '[^0-9xX]','')
  if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($isbn)) { continue }
  if ($isbn.Length -lt 10) { continue }
  $obj = New-Object PSCustomObject
  $obj | Add-Member -MemberType NoteProperty -Name "書名" -Value $title
  $obj | Add-Member -MemberType NoteProperty -Name "ISBN" -Value $isbn
  $obj | Add-Member -MemberType NoteProperty -Name "適合對象" -Value $target
  $items.Add($obj)
}

# Deduplicate by ISBN (keep first)
$seen = @{}
$final = foreach ($it in $items) { if (-not $seen.ContainsKey($it.ISBN)) { $seen[$it.ISBN] = $true; $it } }

# Output JSON
$json = ($final | Sort-Object "書名") | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText($outPath, $json, [System.Text.Encoding]::UTF8)
Write-Host ("WROTE: {0} items -> {1}" -f $final.Count, $outPath)
