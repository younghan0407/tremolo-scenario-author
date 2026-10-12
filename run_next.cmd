@echo off
rem Updated by AI each step. Run "run_next" from the harness folder.
cd /d "%~dp0"
echo ground all specs (3rd) ...
if exist "work\VIOLA-V4.0\ground_log3.txt" del "work\VIOLA-V4.0\ground_log3.txt"
for %%f in ("..\projects\VIOLA-V4.0\out\VIOLA\V4.0\*.spec.ts") do (
  echo ===== %%~nxf >> "work\VIOLA-V4.0\ground_log3.txt"
  echo   %%~nxf
  call tremolo.cmd ground "%%f" --env 400tst --browser chrome --headless --write --continue --skip-missing --mutate >> "work\VIOLA-V4.0\ground_log3.txt" 2>&1
)
echo.
echo [run_next] done.
