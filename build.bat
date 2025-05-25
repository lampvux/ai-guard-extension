@echo off
REM AI Guard Extension Build Script for Windows
REM This script creates a minified release build of the extension

echo 🚀 Building AI Guard Extension...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if required tools are installed
where terser >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ terser is not installed. Installing...
    npm install -g terser
)

where html-minifier-terser >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ html-minifier-terser is not installed. Installing...
    npm install -g html-minifier-terser
)

REM Clean and create build directory
echo 📁 Creating build directory...
if exist build rmdir /s /q build
mkdir build

REM Minify JavaScript files
echo ⚡ Minifying JavaScript files...
terser content.js --compress --mangle --output build/content.js
terser background.js --compress --mangle --output build/background.js
terser warning.js --compress --mangle --output build/warning.js
terser popup.js --compress --mangle --output build/popup.js
terser options.js --compress --mangle --output build/options.js

REM Minify HTML files
echo 📄 Minifying HTML files...
html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true popup.html -o build/popup.html
html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true options.html -o build/options.html
html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true icon-generator.html -o build/icon-generator.html

REM Copy CSS files
echo 🎨 Copying CSS files...
copy content.css build\
copy popup.css build\
copy options.css build\

REM Copy manifest and other required files
echo 📋 Copying manifest and documentation...
copy manifest.json build\
copy LICENSE build\
copy README.md build\

REM Copy icons directory
echo 🖼️ Copying icons...
xcopy icons build\icons\ /E /I

REM Create release zip (requires PowerShell)
echo 📦 Creating release zip...
powershell -Command "Compress-Archive -Path 'build\*' -DestinationPath 'ai-guard-extension-release.zip' -Force"

echo ✅ Build complete! Release zip created: ai-guard-extension-release.zip
echo 📊 Build statistics:
for /f %%i in ('powershell -Command "(Get-ChildItem -Recurse build | Measure-Object -Property Length -Sum).Sum / 1KB"') do set buildsize=%%i
for /f %%i in ('powershell -Command "(Get-Item ai-guard-extension-release.zip).Length / 1KB"') do set zipsize=%%i
echo    Build size: %buildsize% KB
echo    Zip size: %zipsize% KB

pause 