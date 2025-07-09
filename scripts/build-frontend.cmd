@echo off
cd /d "%~dp0\..\frontend"
call npm ci
call npm run build