# GWTH.ai Email Header Templates

This directory contains 5 branded email header templates for MailerLite email campaigns.

## Available Templates

### Option 1: AI Learning Journey (`option1-ai-journey.html`)
- Features neural network connections and nodes
- Welcome message with "Your AI Learning Journey Begins Here"
- Icons for different learning aspects
- Dark gradient background with cyan glow effects

### Option 2: Course Module Grid (`option2-course-grid.html`)
- 6 course module cards in a grid layout
- Each module has an icon and description
- Glassmorphic card design with hover effects
- Mesh background pattern

### Option 3: Futuristic Dashboard (`option3-futuristic-dashboard.html`)
- Space theme with animated stars
- Learning progress dashboard
- Achievement badges display
- Featured code snippet
- Call-to-action button

### Option 4: Minimalist Tech Stack (`option4-minimalist-tech.html`)
- Clean design with orbiting tech icons
- Python, JavaScript, React, and other tech symbols
- "Learn • Build • Deploy" motto
- Geometric patterns and corner accents

### Option 5: Interactive Learning Lab (`option5-learning-lab.html`)
- 3D perspective workspace
- Multiple windows showing code editor, video player, chat
- Achievement display
- Circuit board background pattern

## Specifications
- **Dimensions:** 1656x801 pixels (exactly matching the original template)
- **Primary Color:** Cyan (#00BCD4)
- **Background:** Dark (#0A0A0B)
- **Font:** Inter (Google Fonts)

## How to Convert to Images

### Method 1: Browser Screenshot
1. Open any HTML file in your browser
2. Press F12 to open Developer Tools
3. Click the device toolbar icon (or press Ctrl+Shift+M)
4. Set custom size to 1656x801
5. Take a screenshot using browser tools or extensions

### Method 2: Using Puppeteer (when dependencies are installed)
```bash
# Install required dependencies
sudo apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
    libasound2 libpangocairo-1.0-0 libgtk-3-0

# Run the conversion script
node convert-to-images.js
```

### Method 3: Online HTML to Image Converters
1. Visit an online converter like:
   - https://htmlcsstoimage.com/
   - https://hcti.io/
   - https://html2canvas.hertzen.com/
2. Copy the HTML content
3. Set dimensions to 1656x801
4. Generate and download the image

### Method 4: Using Chrome/Edge from Command Line
```bash
# For each HTML file, run:
google-chrome --headless --disable-gpu --screenshot="option1.png" \
  --window-size=1656,801 "file:///path/to/option1-ai-journey.html"
```

## Usage in MailerLite

1. Choose your preferred design from the 5 options
2. Convert the HTML to PNG using one of the methods above
3. Upload the image to MailerLite's email editor
4. Use as the header image in your email campaign
5. The image is designed to be the exact size needed for the email template

## Customization

To modify any template:
1. Edit the HTML file directly
2. Colors can be changed by modifying the `#00BCD4` values
3. Text can be updated in the HTML
4. Save and re-convert to image

## Notes
- All templates use the GWTH.ai branding colors
- Designs are optimized for email display
- Mobile responsiveness should be handled by MailerLite's email editor
- Templates include subtle animations that won't appear in static images but add visual interest when viewed as HTML