@echo off
echo ==========================================
echo Setting up Playwright Testing Environment
echo ==========================================

echo.
echo [1/3] Installing Playwright package...
call npm install --save-dev @playwright/test
if %ERRORLEVEL% NEQ 0 (
    echo Error installing Playwright. Trying with bun...
    call bun add -d @playwright/test
)

echo.
echo [2/3] Installing Playwright browsers...
call npx playwright install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing browsers. Trying with bunx...
    call bunx playwright install
)

echo.
echo [3/3] Running E2E Tests...
call npm run test:e2e
if %ERRORLEVEL% NEQ 0 (
    call bun run test:e2e
)

echo.
echo ==========================================
echo Done!
echo ==========================================
pause
