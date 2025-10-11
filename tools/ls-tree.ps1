param(
  [string]$Path = ".",
  [int]$Depth = 4
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Show-Tree($root, $prefix = "", $level = 0, $maxDepth = 4) {
  if ($level -ge $maxDepth) { return }
  $items = Get-ChildItem -LiteralPath $root | Sort-Object -Property @{ Expression = { $_.PSIsContainer }; Descending = $true }, Name
  for ($i = 0; $i -lt $items.Count; $i++) {
    $item = $items[$i]
    $isLast = ($i -eq $items.Count - 1)
    $connector = "├── "
    if ($isLast) { $connector = "└── " }
    $line = $prefix + $connector + $item.Name
    Write-Output $line
    if ($item.PSIsContainer) {
      $newPrefix = $prefix
      if ($isLast) { $newPrefix += "    " } else { $newPrefix += "│   " }
      Show-Tree -root $item.FullName -prefix $newPrefix -level ($level + 1) -maxDepth $maxDepth
    }
  }
}

Write-Output (Resolve-Path -LiteralPath $Path).Path
Show-Tree -root $Path -maxDepth $Depth
