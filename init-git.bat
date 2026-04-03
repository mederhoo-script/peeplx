@echo off
REM PeeplX Monorepo - Git Initialization Script
REM Run this script after installing Git

echo.
echo ========================================
echo PeeplX Monorepo - Git Initialization
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)

echo. Git found. Proceeding with initialization...
echo.

REM Initialize git repository
echo Step 1: Initializing git repository...
git init
if errorlevel 1 (
    echo ERROR: Failed to initialize git
    pause
    exit /b 1
)
echo OK - Git repository initialized
echo.

REM Configure git user (optional)
echo Step 2: Configuring git user (optional)
echo Enter your name (or press Enter to skip):
set /p GIT_USER_NAME=
if not "%GIT_USER_NAME%"=="" (
    git config user.name "%GIT_USER_NAME%"
    echo OK - Git user name set
) else (
    echo Skipped - Using existing git config
)
echo.

echo Step 3: Configuring email (optional)
echo Enter your email (or press Enter to skip):
set /p GIT_USER_EMAIL=
if not "%GIT_USER_EMAIL%"=="" (
    git config user.email "%GIT_USER_EMAIL%"
    echo OK - Git email set
) else (
    echo Skipped - Using existing git config
)
echo.

REM Add all files
echo Step 4: Adding all files to staging area...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo OK - All files staged
echo.

REM Show status
echo Step 5: Git status
call git status
echo.

REM Create initial commit
echo Step 6: Creating initial commit...
git commit -m "Initial commit: PeeplX monorepo - React 19 + Vite frontend with NestJS backend"
if errorlevel 1 (
    echo ERROR: Failed to commit
    pause
    exit /b 1
)
echo OK - Initial commit created
echo.

REM Create main branch
echo Step 7: Creating main branch...
git branch -M main
if errorlevel 1 (
    echo Note: main branch already exists
)
echo.

REM Display next steps
echo ========================================
echo SUCCESS! Git initialization complete
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Add your GitHub remote:
echo    git remote add origin https://github.com/YOUR_USERNAME/peeplx-platform.git
echo.
echo 2. Push to GitHub:
echo    git push -u origin main
echo.
echo 3. Start development:
echo    npm install
echo    cd docker ^&^& docker-compose up -d ^&^& cd ..
echo    npm run dev
echo.
echo ========================================
echo.
pause
