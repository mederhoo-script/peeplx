#!/bin/bash

# PeeplX Monorepo - Git Initialization Script
# Run this script after installing Git

echo ""
echo "========================================"
echo "PeeplX Monorepo - Git Initialization"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed"
    echo "Please install Git using:"
    echo "  macOS: brew install git"
    echo "  Linux: sudo apt-get install git"
    exit 1
fi

echo "Git found. Proceeding with initialization..."
echo ""

# Initialize git repository
echo "Step 1: Initializing git repository..."
git init
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to initialize git"
    exit 1
fi
echo "OK - Git repository initialized"
echo ""

# Configure git user (optional)
echo "Step 2: Configuring git user (optional)"
read -p "Enter your name (or press Enter to skip): " GIT_USER_NAME
if [ ! -z "$GIT_USER_NAME" ]; then
    git config user.name "$GIT_USER_NAME"
    echo "OK - Git user name set"
else
    echo "Skipped - Using existing git config"
fi
echo ""

echo "Step 3: Configuring email (optional)"
read -p "Enter your email (or press Enter to skip): " GIT_USER_EMAIL
if [ ! -z "$GIT_USER_EMAIL" ]; then
    git config user.email "$GIT_USER_EMAIL"
    echo "OK - Git email set"
else
    echo "Skipped - Using existing git config"
fi
echo ""

# Add all files
echo "Step 4: Adding all files to staging area..."
git add .
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to add files"
    exit 1
fi
echo "OK - All files staged"
echo ""

# Show status
echo "Step 5: Git status"
git status
echo ""

# Create initial commit
echo "Step 6: Creating initial commit..."
git commit -m "Initial commit: PeeplX monorepo - React 19 + Vite frontend with NestJS backend"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to commit"
    exit 1
fi
echo "OK - Initial commit created"
echo ""

# Create main branch
echo "Step 7: Creating main branch..."
git branch -M main
echo ""

# Display next steps
echo "========================================"
echo "SUCCESS! Git initialization complete"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Add your GitHub remote:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/peeplx-platform.git"
echo ""
echo "2. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "3. Start development:"
echo "   npm install"
echo "   cd docker && docker-compose up -d && cd .."
echo "   npm run dev"
echo ""
echo "========================================"
echo ""
