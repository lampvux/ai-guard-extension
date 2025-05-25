# AI Guard - Chrome Extension

AI Guard is a Chrome extension that protects users from malicious links and detects AI-generated content in Google search results.

## Features

### 🛡️ Link Protection
- **Domain Verification**: Checks if the actual link matches the displayed URL
- **Suspicious Pattern Detection**: Identifies IP addresses, URL shorteners, and punycode domains
- **Homograph Attack Detection**: Detects lookalike characters used in phishing attempts
- **Click Interception**: Warns users before navigating to suspicious links

### 🤖 AI Content Detection
- **Pattern Recognition**: Identifies common AI-generated phrases and structures
- **Writing Style Analysis**: Detects overly formal language and repetitive patterns
- **Grammar Analysis**: Checks for perfect grammar and lack of contractions
- **Confidence Scoring**: Provides a percentage-based confidence level for AI detection

### ⚙️ Customizable Settings
- Toggle link protection on/off
- Toggle AI detection on/off
- Beautiful options page with detailed feature descriptions

## Installation

### From Source
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your toolbar

### Generate Icons
1. Open `icon-generator.html` in a web browser
2. Click "Download All Icons"
3. Move the downloaded icons to the `icons/` folder

## Usage

1. **Search on Google**: The extension automatically activates on Google search pages
2. **View Indicators**: Look for security indicators below each search result:
   - ✓ Green checkmark: Link verified as safe
   - ⚠️ Orange warning: Suspicious link detected
   - 🤖 Robot icon: AI-generated content detected
   - 👤 Person icon: Likely human-written content

3. **Hover for Details**: Hover over indicators to see detailed information
4. **Click Protection**: When clicking suspicious links, you'll see a confirmation dialog
5. **Settings**: Click the extension icon and then "Settings" to customize features

## How It Works

### Link Protection Algorithm
- Extracts and compares actual vs displayed domains
- Checks against known suspicious patterns
- Detects homograph attacks using lookalike character mappings
- Identifies URL shorteners that could hide malicious destinations

### AI Detection Algorithm
- Analyzes text for common AI language patterns
- Examines sentence structure repetition
- Calculates formality ratio based on word usage
- Checks for perfect grammar and lack of contractions
- Generates confidence score (0-100%)

## Privacy

AI Guard operates entirely locally in your browser:
- No data is sent to external servers
- No personal information is collected
- All analysis happens in real-time on your device

## Development

### Project Structure
```
ai-guard-extension/
├── manifest.json          # Extension manifest (v3)
├── background.js          # Service worker for link/AI checking
├── content.js            # Content script for Google search pages
├── content.css           # Additional styles (currently empty)
├── popup.html/css/js     # Extension popup interface
├── options.html/css/js   # Settings page
├── warning.js            # Warning banner for suspicious pages
├── icon-generator.html   # Tool to generate extension icons
├── icons/                # Extension icons (16, 32, 48, 128px)
├── build.sh              # Unix/Linux build script
├── build.bat             # Windows build script
├── .github/workflows/    # GitHub Actions for automated builds
└── README.md            # This file
```

### Building for Release

#### Automated Builds (GitHub Actions)
The extension includes a GitHub Action workflow that automatically creates minified release builds:

- **Trigger**: Push a tag starting with `v` (e.g., `v1.0.0`) or manually trigger the workflow
- **Process**: Minifies all JavaScript and HTML files, copies required assets, creates a release zip
- **Output**: Downloadable artifact and GitHub release with the minified extension

To create a release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### Local Builds
For local development and testing:

**Unix/Linux/macOS:**
```bash
./build.sh
```

**Windows:**
```cmd
build.bat
```

Both scripts will:
1. Install required tools (`terser` and `html-minifier-terser`)
2. Minify all JavaScript files (reduces size by ~60-70%)
3. Minify all HTML files (removes whitespace and comments)
4. Copy all required files to a `build/` directory
5. Create a `ai-guard-extension-release.zip` file ready for distribution

#### Build Requirements
- Node.js (for minification tools)
- `terser` (JavaScript minifier)
- `html-minifier-terser` (HTML minifier)

The build scripts will automatically install these tools if they're not present.

### Technologies Used
- Chrome Extension Manifest V3
- JavaScript (ES6+)
- HTML5 & CSS3
- Chrome APIs (storage, tabs, webNavigation)
- GitHub Actions for CI/CD
- Terser for JavaScript minification
- html-minifier-terser for HTML minification

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is provided as-is for educational and personal use.

## Future Enhancements

- Integration with external malware databases
- Advanced AI detection using machine learning APIs
- Support for other search engines
- Whitelist/blacklist functionality
- Export security reports
- Multi-language support
