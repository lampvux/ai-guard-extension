#!/bin/bash

# AI Guard Extension Build Script
# This script creates a minified release build of the extension

set -e

echo "🚀 Building AI Guard Extension..."

# Check if required tools are installed
if ! command -v terser &>/dev/null; then
    echo "❌ terser is not installed. Installing..."
    npm install -g terser
fi

if ! command -v html-minifier-terser &>/dev/null; then
    echo "❌ html-minifier-terser is not installed. Installing..."
    npm install -g html-minifier-terser
fi

# Clean and create build directory
echo "📁 Creating build directory..."
rm -rf build
mkdir -p build

# Minify JavaScript files
echo "⚡ Minifying JavaScript files..."
terser content.js --compress --mangle --output build/content.js
terser background.js --compress --mangle --output build/background.js
terser warning.js --compress --mangle --output build/warning.js
terser popup.js --compress --mangle --output build/popup.js
terser options.js --compress --mangle --output build/options.js

# Minify HTML files
echo "📄 Minifying HTML files..."
html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true popup.html -o build/popup.html
html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true options.html -o build/options.html
html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true icon-generator.html -o build/icon-generator.html

# Copy CSS files (no minification needed for small files)
echo "🎨 Copying CSS files..."
cp content.css build/
cp popup.css build/
cp options.css build/

# Copy manifest and other required files
echo "📋 Copying manifest and documentation..."
cp manifest.json build/
cp LICENSE build/
cp README.md build/

# Copy icons directory
echo "🖼️  Copying icons..."
cp -r icons build/

# Create release zip
echo "📦 Creating release zip..."
cd build
zip -r ../ai-guard-extension-release.zip .
cd ..

echo "✅ Build complete! Release zip created: ai-guard-extension-release.zip"
echo "📊 Build statistics:"
echo "   Original size: $(du -sh . --exclude=build --exclude=.git | cut -f1)"
echo "   Build size: $(du -sh build | cut -f1)"
echo "   Zip size: $(du -sh ai-guard-extension-release.zip | cut -f1)"
