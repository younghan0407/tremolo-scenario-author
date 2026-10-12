# tremolo.ps1 — 사용자 PC(Windows)에서 하네스 라이브 작업을 실행하는 단일 진입점.
# 대상 서비스가 사내망 전용인 경우가 많아 Playwright/Chrome 은 반드시 이 PC 에서 띄운다.
# 모든 출력은 runlogs\ 에 UTF-8 로그로 남는다 → AI 가 연결된 폴더에서 결과를 읽어 다음 단계를 진행.
#
#   tremolo.cmd check                       현재 환경으로 로그인 확인(Chrome 창 표시)
#   tremolo.cmd env [use 306tst | list ...] 접속 정보 확인/전환
#   tremolo.cmd probe --nav "컴퓨트>인스턴스" --name instance-list
#   tremolo.cmd explore --url <생성 URL> --name <fn>
#   tremolo.cmd walk <actions.json> [--out <dir>] [--headless]   비변경 화면 탐색·덤프
#   tremolo.cmd ground "<spec.ts>" --write
#   tremolo.cmd smoke "<spec.ts>"
#   tremolo.cmd generate <name>.steps.json  /  verify "<spec.ts>"
#   tremolo.cmd setup | selftest
#   (브라우저 지정: 아무 작업에나 --browser chrome-131 | chrome | msedge | bundled(기본))
#   ── 프로젝트·결과 기록 (Python3 + openpyxl) ──
#   tremolo.cmd project [list | use <이름> | init <솔루션> <버전> --tc <TC.xlsx> --env <키>]
#   tremolo.cmd runs                        Tremolo 실행 목록(이 프로젝트분, 기록 여부)
#   tremolo.cmd record <#|Run ID|latest>    결과 기록 미리보기(쓰지 않음) → 확인 후 같은 명령에 --apply
#   tremolo.cmd build                       산출물 워크북 다시 그리기(판정 열 반영)
# param 블록을 쓰지 않는다: '--write' 같은 인자가 PowerShell 파라미터로 오인되지 않도록 $args 를 그대로 전달.
$Task = if ($args.Count -gt 0) { [string]$args[0] } else { 'help' }
$Rest = if ($args.Count -gt 1) { @($args[1..($args.Count - 1)] | ForEach-Object { [string]$_ }) } else { @() }
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location $PSScriptRoot
$env:FORCE_COLOR = '0'; $env:NO_COLOR = '1'   # 로그에 ANSI 색 코드가 섞이지 않도록

$map = @{
  'check'    = @('scripts/env.mjs', 'check', '--headed')
  'env'      = @('scripts/env.mjs')
  'probe'    = @('scripts/live/probe.mjs')
  'explore'  = @('scripts/live/explore.mjs')
  'walk'     = @('scripts/live/walk.mjs')
  'ground'   = @('scripts/live/ground.mjs')
  'smoke'    = @('scripts/live/smoke.mjs')
  'generate' = @('scripts/generate.mjs')
  'verify'   = @('scripts/verify.mjs')
  'selftest' = @('scripts/live/__selftest__/run.mjs')
  'setup'    = @('setup.mjs')
}
$pyMap = @{
  'project' = @('scripts/project/manage.py')
  'runs'    = @('scripts/results/record.py', 'runs')
  'record'  = @('scripts/results/record.py', 'record')
  'build'   = @('scripts/results/deliverable.py', 'build')
  'author'  = @('scripts/project/author.py')
}
if (-not $map.ContainsKey($Task) -and -not $pyMap.ContainsKey($Task)) {
  Get-Content $PSCommandPath -Encoding UTF8 | Select-Object -Skip 1 -First 18 | ForEach-Object { $_ -replace '^# ?', '' }
  exit 2
}
if ($pyMap.ContainsKey($Task)) {
  # 'python' 이 Microsoft Store 바로가기(WindowsApps 별칭)면 실제 Python 이 아니므로 py 런처를 먼저 쓴다.
  $exe = $null
  foreach ($c in @('py', 'python', 'python3')) {
    if (Get-Command $c -ErrorAction SilentlyContinue) { & $c -c 'import sys' 2>$null; if ($LASTEXITCODE -eq 0) { $exe = $c; break } }
  }
  if (-not $exe) { Write-Host 'Python 3 가 필요합니다: https://www.python.org (설치 후 pip install openpyxl)'; exit 2 }
  & $exe -c 'import openpyxl' 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Host "openpyxl 이 필요합니다:  $exe -m pip install openpyxl"; exit 2 }
  $env:PYTHONIOENCODING = 'utf-8'
  $cmdArgs = @($pyMap[$Task]) + $Rest
} else {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Host 'Node.js 18+ 가 필요합니다: https://nodejs.org'; exit 2 }
  $exe = 'node'
  $cmdArgs = @($map[$Task]) + $Rest
}

New-Item -ItemType Directory -Force -Path 'runlogs' | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$log = Join-Path 'runlogs' "$stamp-$Task.log"
"# $(Get-Date -Format o)  task=$Task  cmd=$exe $($cmdArgs -join ' ')" | Out-File -FilePath $log -Encoding utf8

& $exe @cmdArgs 2>&1 | ForEach-Object {
  # PowerShell 5.1 은 stderr 줄을 ErrorRecord 로 감싼다 → 메시지만 꺼내고, 빈 줄의 RemoteException 표기는 버린다.
  $line = if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.Exception.Message } else { "$_" }
  if ($line -eq 'System.Management.Automation.RemoteException') { $line = '' }
  Write-Host $line
  Add-Content -Path $log -Value $line -Encoding utf8
}
$code = $LASTEXITCODE
"# exit=$code" | Add-Content -Path $log -Encoding utf8
Copy-Item $log (Join-Path 'runlogs' 'latest.log') -Force
Write-Host "`n[tremolo] 로그: $log  (exit=$code) — AI에게 '실행했어'라고만 알려주면 로그를 읽고 이어갑니다."
exit $code
