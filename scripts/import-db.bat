@echo off
setlocal enabledelayedexpansion

echo.
echo ====================================
echo   Urban Golf - Database Import
echo ====================================
echo.

set CONTAINER_NAME=urbangolf-postgres-dev
set DB_USER=postgres
set DB_NAME=urban_golf
set DUMP_FILE=backend\db\init\schema.sql

REM Check if dump file exists
if not exist "%DUMP_FILE%" (
    echo [ERROR] Dump file not found: %DUMP_FILE%
    echo.
    exit /b 1
)

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop first.
    echo.
    exit /b 1
)

REM Check if container is running
docker ps --filter name=%CONTAINER_NAME% --format "{{.Names}}" | findstr %CONTAINER_NAME% >nul
if errorlevel 1 (
    echo [ERROR] Container '%CONTAINER_NAME%' is not running!
    echo Start it with: docker-compose -f docker-compose.dev.yml up -d
    echo.
    exit /b 1
)

echo [OK] Container running: %CONTAINER_NAME%
echo [OK] Dump file found: %DUMP_FILE%
echo.
echo Importing database dump...
echo.

REM Import using type command (works better on Windows)
type "%DUMP_FILE%" | docker exec -i %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME%

if errorlevel 1 (
    echo.
    echo [ERROR] Database import failed!
    echo.
    exit /b 1
)

echo.
echo ====================================
echo   Import Complete!
echo ====================================
echo.
echo Verify with:
echo docker exec -it %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% -c "\dt"
echo.

endlocal
