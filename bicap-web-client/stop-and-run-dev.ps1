# Dung Next.js dang chay va xoa lock, sau do chay lai npm run dev
$ErrorActionPreference = "SilentlyContinue"

Write-Host "Dang dung process chiem port 3000 va 3001..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | ForEach-Object {
    $pid = $_.OwningProcess
    if ($pid) {
        Stop-Process -Id $pid -Force
        Write-Host "  Da dung process $pid" -ForegroundColor Gray
    }
}
Start-Sleep -Seconds 2

$lockPath = Join-Path $PSScriptRoot ".next\dev\lock"
if (Test-Path $lockPath) {
    Remove-Item $lockPath -Force
    Write-Host "Da xoa file lock." -ForegroundColor Gray
}

Write-Host "Chay lai: npm run dev" -ForegroundColor Green
Set-Location $PSScriptRoot
npm run dev
